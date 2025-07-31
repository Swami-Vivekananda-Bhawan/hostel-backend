-- Agar database maujood nahi hai, to use banayein
CREATE DATABASE IF NOT EXISTS hostel_db;
USE hostel_db;

-- Purani tables ko sahi order mein delete karein taki error na aaye
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `qna`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `users`;

-- 'users' table ko naye structure ke saath dobara banayein
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `scholar_number` VARCHAR(255) NOT NULL UNIQUE,
  `mobile_number` VARCHAR(20) NULL,
  `room_number` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL UNIQUE,
  `password` VARCHAR(255) NULL,
  `reset_otp` VARCHAR(10) NULL DEFAULT NULL,
  `reset_otp_expires` DATETIME NULL DEFAULT NULL,
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 'leave_requests' table ko dobara banayein
CREATE TABLE `leave_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `scholar_number` VARCHAR(255) NOT NULL,
  `mobile_number` VARCHAR(20),
  `room_number` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `leave_fk_user` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 'complaints' table ko dobara banayein
CREATE TABLE `complaints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `scholar_number` VARCHAR(255) NOT NULL,
  `room_number` VARCHAR(50) NOT NULL,
  `mobile_number` VARCHAR(20),
  `category` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `media_path` VARCHAR(255) NULL,
  `status` ENUM('Open', 'Accepted', 'Resolved', 'Rejected') DEFAULT 'Open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `complaint_fk_user` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 'qna' table ko dobara banayein
CREATE TABLE `qna` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NULL,
  `status` ENUM('unanswered', 'answered') DEFAULT 'unanswered',
  `is_seen_by_student` TINYINT NOT NULL DEFAULT 0,
  `question_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `answer_timestamp` TIMESTAMP NULL,
  CONSTRAINT `qna_fk_user` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 'notifications' table ko dobara banayein
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `is_read` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `notification_fk_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Default Admin User (password: admin123) ko dobara add karein
INSERT INTO `users` (`email`, `password`, `full_name`, `scholar_number`, `role`)
VALUES 
('admin@hostel11.com', '$2a$10$f/P.g3.JE2z4b3gR.0aMGe.F.41s2x2/E9v.y5k2x5Y5Y5Y5Y5Y5Y', 'Admin', 'ADMIN001', 'admin')
ON DUPLICATE KEY UPDATE email=email;
