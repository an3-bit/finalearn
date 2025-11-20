# app/services/progress_service.py
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from mysql.connector import Error
from fastapi import HTTPException
from app.utils.database import db_manager
from app.models.schemas import UserProgressRequest

logger = logging.getLogger(__name__)


class ProgressService:
    def __init__(self):
        self.db_manager = db_manager

    def update_user_progress(self, progress: UserProgressRequest) -> Dict[str, str]:
        """Update user progress in the database"""
        connection = self.db_manager.get_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        try:
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO user_progress 
                (user_id, module, week, day, topic, lesson_completed, quiz_score, time_spent, completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                lesson_completed = VALUES(lesson_completed),
                quiz_score = VALUES(quiz_score),
                time_spent = VALUES(time_spent),
                completed_at = VALUES(completed_at)
            """, (
                progress.user_id, progress.module, progress.week, progress.day,
                "", progress.lesson_completed, progress.quiz_score, progress.time_spent,
                datetime.now() if progress.lesson_completed else None
            ))
            connection.commit()
            return {"status": "success", "message": "Progress updated"}
        except Error as e:
            logger.error(f"Error updating progress: {e}")
            raise HTTPException(status_code=500, detail="Failed to update progress")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    def get_user_progress(self, user_id: str) -> Dict[str, List[Dict]]:
        """Get user progress from the database"""
        connection = self.db_manager.get_connection()
        if not connection:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT * FROM user_progress 
                WHERE user_id = %s 
                ORDER BY week, day
            """, (user_id,))
            progress = cursor.fetchall()
            return {"progress": progress}
        except Error as e:
            logger.error(f"Error getting progress: {e}")
            raise HTTPException(status_code=500, detail="Failed to get progress")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    def save_lesson_plan(self, module: str, duration: str, plan_data: Dict[str, Any]) -> bool:
        """Save lesson plan to database"""
        connection = self.db_manager.get_connection()
        if not connection:
            logger.error("Database connection failed")
            return False
        
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO lesson_plans (module, duration, plan_data) VALUES (%s, %s, %s)",
                (module, duration, json.dumps(plan_data))
            )
            connection.commit()
            logger.info(f"Saved lesson plan for module: {module}")
            return True
        except Error as e:
            logger.error(f"Error saving lesson plan: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    def save_lesson_content(self, topic: str, content: Dict[str, Any]) -> bool:
        """Save lesson content to database"""
        connection = self.db_manager.get_connection()
        if not connection:
            logger.error("Database connection failed")
            return False
        
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO lesson_content (topic, content) VALUES (%s, %s)",
                (topic, json.dumps(content))
            )
            connection.commit()
            logger.info(f"Saved lesson content for topic: {topic}")
            return True
        except Error as e:
            logger.error(f"Error saving lesson content: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    def save_chart_tasks(self, topic: str, tasks: Dict[str, Any]) -> bool:
        """Save chart tasks to database"""
        connection = self.db_manager.get_connection()
        if not connection:
            logger.error("Database connection failed")
            return False
        
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO chart_tasks (topic, tasks) VALUES (%s, %s)",
                (topic, json.dumps(tasks))
            )
            connection.commit()
            logger.info(f"Saved chart tasks for topic: {topic}")
            return True
        except Error as e:
            logger.error(f"Error saving chart tasks: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    def save_assessment(self, module: str, assessment_data: Dict[str, Any]) -> bool:
        """Save assessment to database"""
        connection = self.db_manager.get_connection()
        if not connection:
            logger.error("Database connection failed")
            return False
        
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO assessments (module, assessment_data) VALUES (%s, %s)",
                (module, json.dumps(assessment_data))
            )
            connection.commit()
            logger.info(f"Saved assessment for module: {module}")
            return True
        except Error as e:
            logger.error(f"Error saving assessment: {e}")
            return False
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()


# Global progress service instance
progress_service = ProgressService()
