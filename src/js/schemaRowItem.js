import { extend } from "underscore";

class SchemaRowItem {
    constructor(row) {
        this.row = extend({
            id: "",
            name: "",
            type: "",
            require: "",
            defaultValue: "",
            description: "",
            data: []
        }, row)
    }

    getRow() {
        return this.row
    }
}


export { SchemaRowItem as default}