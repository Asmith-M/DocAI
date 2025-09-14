import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any

import camelot
import tabula

log = logging.getLogger(__name__)

class TableExtractor:
    def __init__(self):
        self.tables_storage = Path(os.getcwd()) / "app" / "storage" / "tables"
        self.tables_storage.mkdir(parents=True, exist_ok=True)

    def extract_tables(self, pdf_path: Path, document_id: str) -> int:
        """
        Extract tables from PDF using Camelot, fallback to Tabula.
        Save each table as JSON in app/storage/tables/{document_id}/
        Returns the number of tables extracted.
        """
        output_dir = self.tables_storage / document_id
        output_dir.mkdir(parents=True, exist_ok=True)

        tables_extracted = 0

        try:
            log.info(f"Starting table extraction with Camelot for {pdf_path}")
            camelot_tables = camelot.read_pdf(str(pdf_path), pages='all', flavor='stream')
            if camelot_tables:
                log.info(f"Camelot extracted {len(camelot_tables)} tables")
                for idx, table in enumerate(camelot_tables):
                    table_json = {
                        "document_id": document_id,
                        "page": table.page,
                        "table_index": idx + 1,
                        "data": table.df.values.tolist()
                    }
                    table_file = output_dir / f"table_{table.page}_{idx+1}.json"
                    with open(table_file, "w", encoding="utf-8") as f:
                        json.dump(table_json, f, indent=2)
                    tables_extracted += 1
                return tables_extracted
            else:
                log.warning("Camelot found no tables, trying Tabula fallback")
        except Exception as e:
            log.warning(f"Camelot extraction failed: {e}. Trying Tabula fallback.")

        # Fallback to Tabula
        try:
            log.info(f"Starting table extraction with Tabula for {pdf_path}")
            tabula_tables = tabula.read_pdf(str(pdf_path), pages='all', multiple_tables=True)
            if tabula_tables:
                log.info(f"Tabula extracted {len(tabula_tables)} tables")
                for idx, df in enumerate(tabula_tables):
                    # Tabula does not provide page number directly, so we set page as None
                    table_json = {
                        "document_id": document_id,
                        "page": None,
                        "table_index": idx + 1,
                        "data": df.values.tolist()
                    }
                    table_file = output_dir / f"table_tabula_{idx+1}.json"
                    with open(table_file, "w", encoding="utf-8") as f:
                        json.dump(table_json, f, indent=2)
                    tables_extracted += 1
                return tables_extracted
            else:
                log.warning("Tabula found no tables")
        except Exception as e:
            log.warning(f"Tabula extraction failed: {e}")

        return tables_extracted

    def get_tables(self, document_id: str) -> List[Dict[str, Any]]:
        """
        Return all table JSONs for a given document_id.
        """
        output_dir = self.tables_storage / document_id
        if not output_dir.exists():
            log.warning(f"No tables found for document_id {document_id}")
            return []

        tables = []
        for file in output_dir.glob("*.json"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    table_json = json.load(f)
                    tables.append(table_json)
            except Exception as e:
                log.warning(f"Failed to load table JSON {file}: {e}")
                continue
        return tables

# Global instance
table_extractor = TableExtractor()
