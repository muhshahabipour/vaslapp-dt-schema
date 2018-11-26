import { each } from "underscore"

class SchemaRowList {
    constructor(data) {
        this.data = data || [];
    }

    addRowItem(row) {
        this.data.push(row.getRow())
    }

    removeRowItem(idToRemove) {
        this.data = this.delNestedRowItem(idToRemove, this.data);
    };

    getList() {
        return this.data;
    }

    delNestedRowItem(idToRemove, list) {
        var self = this
        
        var finalList = list.filter(el => {
            if (el.data && el.data.length) {
                el.data = self.delNestedRowItem(idToRemove, el.data);
            }
            return el.id !== idToRemove; //delete this
        });

        return finalList;
    }

    addNestedRowItem(idToAdd, value, list) {
        var self = this

        list = list || this.data;

        var finalList = each(list, function (item) {
            if (item.id == idToAdd) {
                var list = new SchemaRowList(item.data);
                list.addRowItem(value);
                item.data = list.getList();
            } else if (item.data && item.data.length) {
                item = self.addNestedRowItem(idToAdd, value, item.data)
            }

            return item;
        });

        return finalList;
    }


    updateValueNestedRowItem(idToUpdate, name, value, list) {
        var self = this

        list = list || this.data;

        var finalList = each(list, function (item) {
            if (item.id == idToUpdate) {
                item[name] = value;
            } else if (item.data && item.data.length) {
                item = self.updateValueNestedRowItem(idToUpdate, name, value, item.data)
            }

            return item;
        });

        return finalList;
    }
}


export { SchemaRowList as default }