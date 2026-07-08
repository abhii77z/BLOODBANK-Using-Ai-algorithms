# pip install pymongo dnspython
import os
from pymongo import MongoClient
from bson import ObjectId
from flask.json.provider import DefaultJSONProvider


# ─────────────────────────────────────────────────────────────
#  Custom JSON encoder so Flask's jsonify() can handle ObjectId
#  Without this, any route that returns an ObjectId crashes with
#  "Object of type ObjectId is not JSON serializable"
# ─────────────────────────────────────────────────────────────
class MongoJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)


class MongoDB(object):

    def __init__(self, db_name=None, username=None, password=None, host=None, port=None):
        
        if db_name is None:
            db_name = os.getenv("MONGO_DATABASE") or "AIbloodbank"
        if username is None:
            username = os.getenv("MONGO_USERNAME")
        if password is None:
            password = os.getenv("MONGO_PASSWORD")
        if host is None:
            host = os.getenv("MONGO_HOST") or "localhost"
        if port is None:
            port = os.getenv("MONGO_PORT") or "27017"

        if username and password:
            uri = f"mongodb://{username}:{password}@{host}:{port}/{db_name}"
        else:
            uri = f"mongodb://{host}:{port}/"

        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def get_collection(self, collection_name):
        return self.db[collection_name]

    def insert_one(self, collection, data):
        col = self.get_collection(collection)
        result = col.insert_one(data)
        return str(result.inserted_id)

    def find_one(self, collection, query):
        """
        Returns the raw document — ObjectIds stay as ObjectId.
        The custom JSON encoder handles serialization automatically.
        KEY FIX: Do NOT convert _id to string here because that breaks
        cross-collection lookups like find({"usertype": login_record["_id"]}).
        """
        col = self.get_collection(collection)
        return col.find_one(query)

    def find_all(self, collection, query={}):
        col = self.get_collection(collection)
        return list(col.find(query))

    def update_one(self, collection, query, new_values):
        col = self.get_collection(collection)
        result = col.update_one(query, {"$set": new_values})
        return result.modified_count

    def delete_one(self, collection, query):
        col = self.get_collection(collection)
        result = col.delete_one(query)
        return result.deleted_count


def oid(id_str):
    """Convert string to ObjectId. Safe to call on an already-ObjectId value."""
    if isinstance(id_str, ObjectId):
        return id_str
    return ObjectId(str(id_str))