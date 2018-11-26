'use strict'

import $ from "jquery";
import _ from "underscore";
import notie from "notie";
import SchemaRowList from "./schemaRowList";
import SchemaRowItem from "./schemaRowItem";
import "../scss/style.scss";

var guid = function () {
    return '_' + Math.random().toString(36).substr(2, 9);
};


// Singleton design pattern
var schema = (function () {

    var options = [];
    var schemaRowList = new SchemaRowList();

    // public
    var setData = function (data) {
        data.forEach(function (rowItem) {
            var item = new SchemaRowItem(rowItem);
            schemaRowList.addRowItem(item);
        })

        renderItems();
    };

    // public
    var setOptions = function (data) {
        options = data
    };

    // private
    var selectEventListener = function () {
        $('select').on("change", function (event) {
            var item = $(event.currentTarget);
            var canAdd = item.data("canAdd");
            if (canAdd) {
                var id = item.data("id");
                var val = (item.val()).toLowerCase();
                if (val === "object") {
                    showAddSubItem(id);
                    showSubItemList(id);
                } else {
                    hideAddSubItem(id);
                    hideSubItemList(id);
                }
            }

        })
    };

    // private
    var addSubItemEventListener = function () {
        $(".add-sub-item").off("click");
        $(".add-sub-item").on("click", function (event) {
            var elm = $(event.currentTarget);
            addSubItem(elm.data("id"));
        })
    };

    // private
    var deleteEventListener = function () {
        $(".remove-item").off("click");
        $(".remove-item").on("click", function (event) {
            var elm = $(event.currentTarget);
            deleteConfirm(elm.data("id"));
        });
    };

    // private
    var changeEventListener = function () {
        $(".schema-wrapper input[type=text]").off("input");
        $(".schema-wrapper input[type=text]").on("input", function (event) {
            var elm = $(event.currentTarget);
            schemaRowList.updateValueNestedRowItem(elm.data("id"), elm.data("name"), elm.val());
        });
        $(".schema-wrapper input[type=checkbox]").off("change");
        $(".schema-wrapper input[type=checkbox], .schema-wrapper select").on("change", function (event) {
            var elm = $(event.currentTarget);
            schemaRowList.updateValueNestedRowItem(elm.data("id"), elm.data("name"), elm.val());
        });
    };

    // private
    var deleteConfirm = function (id) {
        notie.confirm({
            text: "آیا مایل به حذف این مورد هستید؟",
            submitText: "بله",
            cancelText: "خیر",
            submitCallback: function () {
                schemaRowList.removeRowItem(id);
                renderItems();
            }
        });
    };

    // private
    var addSubItem = function (id) {
        var rowItem = new SchemaRowItem({
            id: guid()
        });
        schemaRowList.addNestedRowItem(id, rowItem);
        renderItems();
    };

    // public
    var addItem = function () {
        var rowItem = new SchemaRowItem({
            id: guid()
        });
        schemaRowList.addRowItem(rowItem);
        renderItems();
    }


    // private
    var renderItems = function () {
        $('.schema-wrapper').html("");
        var list = schemaRowList.getList();
        var rendered = getTemplate(list);
        // console.log("[renderItems] => list", list)
        $('.schema-wrapper').append(rendered);
        $('#schema-no-item').addClass("hidden");

        deleteEventListener();
        addSubItemEventListener();
        selectEventListener();
        changeEventListener();
    };


    var getTemplate = function (data) {
        return `${data.map((obj, i) => 
                `<div class="schema-item" id="schema-item-${obj.id}" data-index="${i}">
                    <div class="flexbox flexbox-align-center" style="padding: 0 1rem">
                        <div class="flexbox flexbox-align-center flexbox-nowrap"  style="margin-right: 1.5rem; flex: 1">
                            <a class="show-detail collapsed" data-toggle="collapse" href="#item-collapse-${obj.id}" role="button" aria-expanded="false" aria-controls="item-collapse-${obj.id}" style="margin-right: 1.5rem"></a>

                            <div class="form" style="direction:ltr;margin-right: 1rem">
                                <input type="text" aria-label="name" placeholder="name" class="form-entry" name="data[${i}].name" data-id="${obj.id}" data-name="name" value="${obj.name}">
                            </div>
                            <div class="form form-select" style="">
                                <select class="form-entry select-bg select-type" data-can-add="true" data-id="${obj.id}" data-name="type" name='data[${i}].type' style="direction:rtl;">
                                    <option value="">انتخاب کنید</option>
                                    ${options.map(option =>
                                    `<option value="${option.value}" ${option.value === obj.type ? `selected="selected"` : ``} >${option.name}</option>`
                                    )}                   
                                </select>
                            </div>
                        </div>
                        <div class="flexbox flexbox-nowrap">
                            <a href="javascript:void(0)" data-id="${obj.id}" class="flexbox add-sub-item ${obj.type.toLowerCase() === "object" ? `` : `hidden`}" style="padding: 0 0.5rem; border-left:1px solid #ddd"></a>
                            <a href="javascript:void(0)" data-id="${obj.id}" class="flexbox remove-item" style="padding-left: 0.5rem;border-left:1px solid #ddd"></a>
                        </div>
                    </div>
                    
                    ${getTemplateChild(obj.id, i, obj.data)}

                    <div class="collapse" id="item-collapse-${obj.id}">
                        <div class="detail-wrapper">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name="data[${i}].required" id="is-require-${obj.id}" data-id="${obj.id}" data-name="require" value="true" ${obj.require ? `checked="checked"` : ``}>
                                <label class="form-check-label" for="is-require-${obj.id}">Required؟</label>
                            </div>
                            <div class="row">
                                <div class="col-xs-12 col-md-6">
                                    <div class="form">
                                        <label for="data[${i}].defaultValue">مقدار اولیه</label>
                                        <input type="text" class="form-entry" name='data[${i}].defaultValue' id='data[${i}].defaultValue' data-id="${obj.id}" data-name="defaultValue" value="${obj.defaultValue}">
                                    </div>
                                </div>
                                <div class="col-xs-12 col-md-6">
                                    <div class="form">
                                        <label for="data[${i}].description">توضیحات</label>
                                        <input type="text" class="form-entry" name='data[${i}].description' id='data[${i}].description'  data-id="${obj.id}" data-name="description" value="${obj.description}">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
        ).join('')}`
    }

    var getTemplateChild = function (id, i, data) {

        return `<div class="flexbox flexbox-col flexbox-just-center schema-sub-items" id="schema-sub-items-${id}">
                    ${data.map((item, j) =>
                        `<div class="flexbox flexbox-align-center flexbox-nowrap schema-sub-item" id="schema-sub-item-${item.id}">
                            <div class="flexbox flexbox-nowrap" style="margin-right: 0.75rem;flex: 1">

                            <div class="form" style="direction:ltr;margin-right: 0.5rem" >
                                <input type="text" aria-label="name" placeholder="name" class="form-entry" data-id="${item.id}" name="data[${i}][${j}].name" data-name="name" value="${item.name}">
                            </div>
                            <div class="form form-select">
                                <select class="form-entry select-bg select-type" data-can-add="false" style="direction:rtl;" name='data[${i}][${j}].type'  data-id="${item.id}" data-name="type">
                                    <option value="">انتخاب کنید</option>
                                    ${options.map(option =>
                                        `<option value="${option.value}" ${option.value === item.type ? `selected="selected"` : ``} >${option.name}</option>`
                                    )}
                                </select>
                            </div>
                            </div>
                            <div class="flexbox flexbox-nowrap" style="padding-left: 0.5rem">
                                <a href="javascript:void(0)" data-id="${item.id}" class="flexbox border-left remove-item" style="padding-left:0.5rem;border-left:1px solid #ddd"></a>
                            </div>
                        </div>`
                    ).join('')}
                </div>`;
    }


    // private
    var showAddSubItem = function (id) {
        $('.add-sub-item[data-id="' + id + '"]').removeClass("hidden")
    };

    // private
    var hideAddSubItem = function (id) {
        $('.add-sub-item[data-id="' + id + '"]').addClass("hidden")
    };

    // private
    var showSubItemList = function (id) {
        $('#schema-sub-items-' + id).removeClass("hidden")
    };

    // private
    var hideSubItemList = function (id) {
        $('#schema-sub-items-' + id).html("");
        $('#schema-sub-items-' + id).addClass("hidden")
    };

    deleteEventListener();
    addSubItemEventListener();
    selectEventListener();
    changeEventListener();


    return {
        addItem: addItem,
        setData: setData,
        setOptions: setOptions,
    };


})();



export default schema;


// $('.add-item-btn').on("click", () => {
//     schema.addItem();
// })



// var a = [{
//     name: "option 1",
//     value: "option 1",
//   }, {
//     name: "object",
//     value: "object",
//   }, {
//     name: "option 2",
//     value: "option 2",
//   }]

// schema.setOptions(a);

// var b = [
//   {
//     id: "_m5i3b2xdi",
//     name: "asd",
//     type: "object",
//     require: "true",
//     defaultValue: "gsdfgdfgfsdgdfgssdfgsdf",
//     description: "gsdhdhsfd",
//     data: [
//       {
//         id: "_kvodn8bz2",
//         name: "sdfgfdgfd",
//         type: "option 1",
//         require: "",
//         defaultValue: "",
//         description: "",
//         data: []
//       },
//       {
//         id: "_cokes30i3",
//         name: "gsfdgdfgd",
//         type: "option 2",
//         require: "",
//         defaultValue: "",
//         description: "",
//         data: []
//       }
//     ]
//   },
//   {
//     id: "_7zydzn41c",
//     name: "gsdfgdfgsdf",
//     type: "option 2",
//     require: "",
//     defaultValue: "",
//     description: "",
//     data: []
//   }
// ]


// schema.setData(b)
