from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


class HypSchema(Schema):
    filename = fields.String()
    filecontent = fields.String()


class Hyp(Resource):
    def get(self):
        try:
            hyps = current_app.HYP_DOCS.choices()
            return hyps, 200
        except:
            return '', 400

    def post(self):
        try:
            hyp_loader = HypSchema()
            hyp = hyp_loader.load(request.json)
            filename, filecontent = hyp["filename"], hyp["filecontent"]
            current_app.HYP_DOCS[filename] = filecontent.splitlines()
            return '', 200
        except:
            return '', 400
