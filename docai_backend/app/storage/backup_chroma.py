import os
import shutil
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
from app.core.config import settings

log = logging.getLogger(__name__)

class ChromaBackupManager:
    """Manages ChromaDB persistence directory backups"""

    def __init__(self):
        self.chroma_dir = Path(settings.CHROMA_PERSIST_DIR)
        self.backup_dir = self.chroma_dir.parent / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(self, backup_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a backup of the ChromaDB persistence directory.

        Args:
            backup_name: Optional custom name for the backup. If not provided,
                        uses timestamp format.

        Returns:
            Dict containing backup info or error details.
        """
        try:
            if not self.chroma_dir.exists():
                return {
                    "success": False,
                    "error": f"Chroma directory does not exist: {self.chroma_dir}"
                }

            # Generate backup name if not provided
            if not backup_name:
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                backup_name = f"chroma_backup_{timestamp}"

            backup_path = self.backup_dir / backup_name

            # Create backup using shutil.copytree
            shutil.copytree(self.chroma_dir, backup_path, dirs_exist_ok=True)

            # Get backup size
            total_size = sum(f.stat().st_size for f in backup_path.rglob('*') if f.is_file())

            log.info(f"ChromaDB backup created successfully: {backup_path}")

            return {
                "success": True,
                "backup_path": str(backup_path),
                "backup_name": backup_name,
                "size_bytes": total_size,
                "created_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            error_msg = f"Failed to create ChromaDB backup: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

    def list_backups(self) -> Dict[str, Any]:
        """
        List all available backups with metadata.

        Returns:
            Dict containing list of backups or error details.
        """
        try:
            backups = []
            if self.backup_dir.exists():
                for backup_path in sorted(self.backup_dir.iterdir()):
                    if backup_path.is_dir():
                        try:
                            # Get backup size
                            total_size = sum(f.stat().st_size for f in backup_path.rglob('*') if f.is_file())

                            # Get creation time from directory
                            created_at = datetime.fromtimestamp(backup_path.stat().st_ctime).isoformat()

                            backups.append({
                                "name": backup_path.name,
                                "path": str(backup_path),
                                "size_bytes": total_size,
                                "created_at": created_at
                            })
                        except Exception as e:
                            log.warning(f"Error reading backup {backup_path.name}: {e}")
                            continue

            return {
                "success": True,
                "backups": backups,
                "total_backups": len(backups)
            }

        except Exception as e:
            error_msg = f"Failed to list backups: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

    def restore_backup(self, backup_name: str) -> Dict[str, Any]:
        """
        Restore ChromaDB from a backup.

        Args:
            backup_name: Name of the backup to restore.

        Returns:
            Dict containing restore result or error details.
        """
        try:
            backup_path = self.backup_dir / backup_name

            if not backup_path.exists():
                return {
                    "success": False,
                    "error": f"Backup does not exist: {backup_name}"
                }

            # Create a backup of current state before restore
            pre_restore_backup = self.create_backup(f"pre_restore_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")

            # Remove current chroma directory
            if self.chroma_dir.exists():
                shutil.rmtree(self.chroma_dir)

            # Restore from backup
            shutil.copytree(backup_path, self.chroma_dir, dirs_exist_ok=True)

            log.info(f"ChromaDB restored successfully from backup: {backup_name}")

            return {
                "success": True,
                "backup_name": backup_name,
                "restored_at": datetime.utcnow().isoformat(),
                "pre_restore_backup": pre_restore_backup.get("backup_name") if pre_restore_backup.get("success") else None
            }

        except Exception as e:
            error_msg = f"Failed to restore backup {backup_name}: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

    def delete_backup(self, backup_name: str) -> Dict[str, Any]:
        """
        Delete a specific backup.

        Args:
            backup_name: Name of the backup to delete.

        Returns:
            Dict containing deletion result or error details.
        """
        try:
            backup_path = self.backup_dir / backup_name

            if not backup_path.exists():
                return {
                    "success": False,
                    "error": f"Backup does not exist: {backup_name}"
                }

            shutil.rmtree(backup_path)

            log.info(f"Backup deleted successfully: {backup_name}")

            return {
                "success": True,
                "backup_name": backup_name,
                "deleted_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            error_msg = f"Failed to delete backup {backup_name}: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

    def cleanup_old_backups(self, keep_count: int = 10) -> Dict[str, Any]:
        """
        Clean up old backups, keeping only the most recent ones.

        Args:
            keep_count: Number of most recent backups to keep.

        Returns:
            Dict containing cleanup result or error details.
        """
        try:
            backups = self.list_backups()
            if not backups.get("success"):
                return backups

            backup_list = backups["backups"]
            if len(backup_list) <= keep_count:
                return {
                    "success": True,
                    "message": f"No cleanup needed. Only {len(backup_list)} backups exist.",
                    "deleted_backups": []
                }

            # Sort by creation time (newest first) and keep only the specified count
            backup_list.sort(key=lambda x: x["created_at"], reverse=True)
            backups_to_delete = backup_list[keep_count:]

            deleted_backups = []
            for backup in backups_to_delete:
                result = self.delete_backup(backup["name"])
                if result["success"]:
                    deleted_backups.append(backup["name"])
                else:
                    log.warning(f"Failed to delete backup {backup['name']}: {result.get('error')}")

            return {
                "success": True,
                "message": f"Cleaned up {len(deleted_backups)} old backups",
                "deleted_backups": deleted_backups,
                "kept_backups": len(backup_list) - len(deleted_backups)
            }

        except Exception as e:
            error_msg = f"Failed to cleanup old backups: {str(e)}"
            log.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }

# Global instance
chroma_backup_manager = ChromaBackupManager()
