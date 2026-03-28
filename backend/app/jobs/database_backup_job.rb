# frozen_string_literal: true

class DatabaseBackupJob
  include Sidekiq::Worker
  
  sidekiq_options queue: :backups, retry: 3, backtrace: true
  
  def perform
    Rails.logger.info "[DatabaseBackupJob] Starting scheduled database backup"
    
    backup_config = {
      backup_dir: Rails.root.join("tmp", "backups"),
      retention_days: 30,
      s3_bucket: ENV["SPACES_BUCKET"],
      s3_region: ENV["SPACES_REGION"],
      s3_endpoint: ENV["SPACES_ENDPOINT"]
    }
    
    # Create backup directory
    FileUtils.mkdir_p(backup_config[:backup_dir])
    
    # Generate backup filename
    date_stamp = Time.zone.now.strftime("%Y%m%d_%H%M%S")
    backup_file = "sincronia_backup_#{date_stamp}.sql.gz"
    backup_path = File.join(backup_config[:backup_dir], backup_file)
    
    # Perform database dump
    Rails.logger.info "[DatabaseBackupJob] Dumping database..."
    
    exit_status = system(
      "PGPASSWORD=#{ENV['POSTGRES_PASSWORD']} pg_dump",
      "-h #{ENV['POSTGRES_HOST']}",
      "-U #{ENV['POSTGRES_USER']}",
      "-d #{ENV['POSTGRES_DB'] || 'sincronia_production'}",
      "--format=plain",
      "--no-owner",
      "--no-privileges",
      out: "#{backup_path}.tmp",
      err: File::NULL
    )
    
    unless exit_status
      raise "pg_dump failed with exit code #{$?.exitstatus}"
    end
    
    # Compress backup
    system("gzip -f #{backup_path}.tmp")
    backup_path_gz = "#{backup_path}.tmp.gz"
    
    if File.exist?(backup_path_gz)
      File.rename(backup_path_gz, backup_path)
    end
    
    backup_size = File.size(backup_path)
    Rails.logger.info "[DatabaseBackupJob] Backup created: #{backup_file} (#{number_to_human_size(backup_size)})"
    
    # Upload to S3 if configured
    if ENV["SPACES_ACCESS_KEY_ID"].present? && ENV["SPACES_SECRET_ACCESS_KEY"].present?
      upload_to_s3(backup_path, backup_file, backup_config)
    end
    
    # Cleanup old backups
    cleanup_old_backups(backup_config)
    
    Rails.logger.info "[DatabaseBackupJob] Backup completed successfully"
    
    {
      success: true,
      backup_file: backup_file,
      backup_size: backup_size,
      backup_path: backup_path
    }
  rescue StandardError => e
    Rails.logger.error "[DatabaseBackupJob] Backup failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    
    # Send alert (could integrate with Sentry/Slack)
    send_alert(e)
    
    {
      success: false,
      error: e.message
    }
  end
  
  private
  
  def upload_to_s3(backup_path, backup_file, config)
    Rails.logger.info "[DatabaseBackupJob] Uploading to S3..."
    
    s3 = Aws::S3::Client.new(
      endpoint: config[:s3_endpoint],
      region: config[:s3_region],
      access_key_id: ENV["SPACES_ACCESS_KEY_ID"],
      secret_access_key: ENV["SPACES_SECRET_ACCESS_KEY"]
    )
    
    File.open(backup_path, "rb") do |file|
      s3.put_object(
        bucket: config[:s3_bucket],
        key: "backups/#{backup_file}",
        body: file,
        content_type: "application/gzip"
      )
    end
    
    Rails.logger.info "[DatabaseBackupJob] Upload completed: s3://#{config[:s3_bucket]}/backups/#{backup_file}"
  end
  
  def cleanup_old_backups(config)
    Rails.logger.info "[DatabaseBackupJob] Cleaning up backups older than #{config[:retention_days]} days..."
    
    # Cleanup local backups
    Dir.glob(File.join(config[:backup_dir], "sincronia_backup_*.sql.gz")).each do |file|
      if File.mtime(file) < config[:retention_days].days.ago
        File.delete(file)
        Rails.logger.info "[DatabaseBackupJob] Deleted old backup: #{File.basename(file)}"
      end
    end
    
    # Cleanup S3 backups (if configured)
    if ENV["SPACES_ACCESS_KEY_ID"].present?
      begin
        s3 = Aws::S3::Client.new(
          endpoint: config[:s3_endpoint],
          region: config[:s3_region],
          access_key_id: ENV["SPACES_ACCESS_KEY_ID"],
          secret_access_key: ENV["SPACES_SECRET_ACCESS_KEY"]
        )
        
        # List and delete old objects
        response = s3.list_objects_v2(
          bucket: config[:s3_bucket],
          prefix: "backups/"
        )
        
        response.contents.each do |object|
          if object.last_modified < config[:retention_days].days.ago
            s3.delete_object(
              bucket: config[:s3_bucket],
              key: object.key
            )
            Rails.logger.info "[DatabaseBackupJob] Deleted S3 backup: #{object.key}"
          end
        end
      rescue => e
        Rails.logger.warn "[DatabaseBackupJob] S3 cleanup failed: #{e.message}"
      end
    end
  end
  
  def send_alert(error)
    # Integrate with Slack/Sentry for alerts
    # SlackNotifier.send_alert("Database backup failed: #{error.message}") if Rails.env.production?
  end
  
  def number_to_human_size(size)
    return "0 Bytes" if size.nil? || size.zero?
    
    units = %w[Bytes KB MB GB TB]
    exponent = (Math.log(size) / Math.log(1024)).to_i
    exponent = units.size - 1 if exponent >= units.size
    
    formatted_size = (size / 1024.0 ** exponent).round(2)
    "#{formatted_size} #{units[exponent]}"
  end
end
