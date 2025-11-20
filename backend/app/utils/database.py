# app/utils/database.py
import mysql.connector
from mysql.connector import Error
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    def __init__(self):
        self.db_config = {
            'host': settings.db_host,
            'database': settings.db_name,
            'user': settings.db_user,
            'password': settings.db_password,
            'port': settings.db_port
        }

    def get_connection(self):
        """Create database connection"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            return connection
        except Error as e:
            logger.error(f"Error connecting to MySQL: {e}")
            return None

    def init_database(self):
        """Initialize database tables"""
        connection = self.get_connection()
        if not connection:
            logger.error("Failed to connect to database")
            return False
        
        try:
            cursor = connection.cursor()
            
            # Create users table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """)
            
            # Create lesson_plans table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS lesson_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                module VARCHAR(255) NOT NULL,
                duration VARCHAR(50) NOT NULL,
                plan_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_module (module),
                INDEX idx_user_module (user_id, module)
            )
            """)
            
            # Create user_progress table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                module VARCHAR(255) NOT NULL,
                week INT NOT NULL,
                day INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                lesson_completed BOOLEAN DEFAULT FALSE,
                quiz_score INT DEFAULT NULL,
                time_spent INT DEFAULT NULL,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_lesson (user_id, module, week, day),
                INDEX idx_user_progress (user_id, module),
                INDEX idx_completion (lesson_completed, completed_at)
            )
            """)
            
            # Create lesson_content table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS lesson_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic VARCHAR(255) NOT NULL,
                content JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_topic (topic)
            )
            """)
            
            # Create chart_tasks table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS chart_tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic VARCHAR(255) NOT NULL,
                tasks JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_topic (topic)
            )
            """)
            
            # Create assessments table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module VARCHAR(255) NOT NULL,
                assessment_data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_module (module)
            )
            """)
            
            # Create quiz_responses table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_responses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                question_index INT NOT NULL,
                user_answer VARCHAR(500) NOT NULL,
                correct_answer VARCHAR(500) NOT NULL,
                is_correct BOOLEAN NOT NULL,
                responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_quiz (user_id, topic)
            )
            """)
            
            # Create trade_evaluations table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS trade_evaluations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                pair VARCHAR(10) NOT NULL,
                direction ENUM('buy', 'sell') NOT NULL,
                stop_loss DECIMAL(10, 5) NOT NULL,
                take_profit DECIMAL(10, 5) NOT NULL,
                reason TEXT NOT NULL,
                score INT NOT NULL,
                risk_level ENUM('low', 'medium', 'high') NOT NULL,
                feedback TEXT NOT NULL,
                improvements JSON NOT NULL,
                evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_trades (user_id, evaluated_at)
            )
            """)
            
            # Create user_sessions table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                current_step INT DEFAULT 1,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_sessions (user_id, is_completed)
            )
            """)
            
            # Insert sample user for testing
            cursor.execute("""
            INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name) 
            VALUES ('testuser', 'test@finalearn.com', 'dummy_hash', 'Test', 'User')
            """)
            
            connection.commit()
            logger.info("Database tables initialized successfully")
            return True
            
        except Error as e:
            logger.error(f"Error initializing database: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()


# Global database manager instance
db_manager = DatabaseManager()
