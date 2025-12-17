"""Wikidata ingestion tasks."""
from typing import List, Dict, Any
import requests
from SPARQLWrapper import SPARQLWrapper, JSON
from celery import shared_task
from django.conf import settings
from works.services import WorkService
from screen.services import ScreenWorkService, AdaptationEdgeService


SPARQL_QUERY = """
SELECT ?screenWork ?screenWorkLabel ?bookWork ?bookWorkLabel WHERE {
  ?screenWork wdt:P144 ?bookWork.  # P144 = "based on"
  ?screenWork wdt:P31/wdt:P279* wd:Q2431196.  # Instance of film/TV series
  ?bookWork wdt:P31/wdt:P279* wd:Q7725634.     # Instance of literary work

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""


@shared_task
def ingest_wikidata_pairs() -> Dict[str, Any]:
    """
    Ingest book → screen adaptation pairs from Wikidata.

    Returns:
        dict: Statistics about the ingestion (created, updated, errors).
    """
    sparql = SPARQLWrapper(settings.WIKIDATA_SPARQL_ENDPOINT)
    sparql.setQuery(SPARQL_QUERY)
    sparql.setReturnFormat(JSON)

    stats = {
        'works_created': 0,
        'screen_works_created': 0,
        'edges_created': 0,
        'errors': 0,
    }

    try:
        results = sparql.query().convert()

        for result in results['results']['bindings']:
            try:
                # Extract QIDs and labels
                book_qid = result['bookWork']['value'].split('/')[-1]
                book_label = result['bookWorkLabel']['value']
                screen_qid = result['screenWork']['value'].split('/')[-1]
                screen_label = result['screenWorkLabel']['value']

                # Create or get work
                work, work_created = WorkService.get_or_create_from_wikidata(
                    qid=book_qid,
                    title=book_label,
                )
                if work_created:
                    stats['works_created'] += 1

                # Create or get screen work (default to MOVIE, refine later)
                screen_work, screen_created = ScreenWorkService.get_or_create_from_wikidata(
                    qid=screen_qid,
                    title=screen_label,
                    screen_type='MOVIE',  # Default, can be refined with additional Wikidata queries
                )
                if screen_created:
                    stats['screen_works_created'] += 1

                # Create adaptation edge
                edge, edge_created = AdaptationEdgeService.create_edge(
                    work=work,
                    screen_work=screen_work,
                    source='WIKIDATA',
                )
                if edge_created:
                    stats['edges_created'] += 1

            except Exception as e:
                stats['errors'] += 1
                print(f"Error processing result: {e}")

    except Exception as e:
        stats['errors'] += 1
        print(f"Error querying Wikidata: {e}")

    return stats
