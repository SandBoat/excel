'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function (window) {
    "use strict";
    if (window.creatExcel) return;
    /**
     * 数组格式转树状结构
     * @param   {array}     array
     * @param   {String}    id
     * @param   {String}    pid
     * @param   {String}    children
     * @return  {Array}
     */
    var arrayToTree = function arrayToTree(array) {
        var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _ref$id = _ref.id;
        var id = _ref$id === undefined ? 'id' : _ref$id;
        var _ref$pid = _ref.pid;
        var pid = _ref$pid === undefined ? 'pid' : _ref$pid;
        var _ref$children = _ref.children;
        var children = _ref$children === undefined ? 'children' : _ref$children;
        var _ref$isfold = _ref.isfold;
        var isfold = _ref$isfold === undefined ? 'isfold' : _ref$isfold;

        var data = JSON.parse(JSON.stringify(array));
        // let data = array;
        var result = [];
        var hash = {};
        data.forEach(function (item, index) {
            hash[data[index][id]] = data[index];
        });

        data.forEach(function (item) {
            var hashVP = hash[item[pid]];
            if (hashVP) {
                if (!hashVP[children]) {
                    hashVP[children] = [];
                    hashVP[isfold] = false;
                }
                hashVP[children].push(item);
            } else {
                result.push(item);
            }
        });
        return result;
    };

    var createDatas = function createDatas(cols, rows) {
        var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var _ref2$colid = _ref2.colid;
        var colid = _ref2$colid === undefined ? 'id' : _ref2$colid;
        var _ref2$colpid = _ref2.colpid;
        var colpid = _ref2$colpid === undefined ? 'pid' : _ref2$colpid;
        var _ref2$rowid = _ref2.rowid;
        var rowid = _ref2$rowid === undefined ? 'id' : _ref2$rowid;
        var _ref2$rowpid = _ref2.rowpid;
        var rowpid = _ref2$rowpid === undefined ? 'pid' : _ref2$rowpid;
        var _ref2$dataColPid = _ref2.dataColPid;
        var dataColPid = _ref2$dataColPid === undefined ? 'colpid' : _ref2$dataColPid;
        var _ref2$dataRowPid = _ref2.dataRowPid;
        var dataRowPid = _ref2$dataRowPid === undefined ? 'rowpid' : _ref2$dataRowPid;

        var datas = {};
        cols.forEach(function (col) {
            rows.forEach(function (row) {
                var _datas$did;

                var did = col[colid] + '-' + row[rowid];
                datas[did] = (_datas$did = {
                    value: 0,
                    canedit: false
                }, _defineProperty(_datas$did, dataColPid, col[colpid] ? col[colpid] + '-' + row[rowid] : ""), _defineProperty(_datas$did, dataRowPid, row[rowpid] ? col[colid] + '-' + row[rowpid] : ""), _defineProperty(_datas$did, 'ischange', false), _datas$did);

                if (col[colpid] && row[rowpid]) {
                    datas[did]["canedit"] = true;
                }
            });
        });
        return datas;
    };

    /**
     * 打印脏数据
     */
    var printChangeDatas = function printChangeDatas() {
        var changes = [];
        for (var key in datas) {
            if (datas.hasOwnProperty(key) && datas[key].ischange) {
                changes.push({
                    id: key,
                    value: datas[key].value
                });
            }
        }
        console.log(changes);
    };

    var dataUpdate = function dataUpdate(datas, dataid, value) {
        var _ref3 = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        var _ref3$dataColPid = _ref3.dataColPid;
        var dataColPid = _ref3$dataColPid === undefined ? 'colpid' : _ref3$dataColPid;
        var _ref3$dataRowPid = _ref3.dataRowPid;
        var dataRowPid = _ref3$dataRowPid === undefined ? 'rowpid' : _ref3$dataRowPid;

        var dValue = value - datas[dataid].value;
        if (dValue) {
            document.querySelector('td[data-id = "' + dataid + '"]').innerText = datas[dataid].value = value;
            document.querySelector('td[data-id = "' + dataid + '"]').classList.add("change");
            datas[dataid].ischange = true;
            if (datas[dataid][dataColPid] && datas[dataid][dataRowPid]) {
                document.querySelector('td[data-id = "' + datas[dataid][dataColPid] + '"]').innerText = datas[datas[dataid][dataColPid]].value += dValue;
                datas[datas[dataid][dataColPid]].ischange = true;
                document.querySelector('td[data-id = "' + datas[dataid][dataRowPid] + '"]').innerText = datas[datas[dataid][dataRowPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
                document.querySelector('td[data-id = "' + datas[datas[dataid][dataColPid]][dataRowPid] + '"]').innerText = datas[datas[datas[dataid][dataColPid]][dataRowPid]].value += dValue;
                datas[datas[datas[dataid][dataColPid]][dataRowPid]].ischange = true;
            } else if (datas[dataid][dataRowPid]) {
                document.querySelector('td[data-id = "' + datas[dataid][dataRowPid] + '"]').innerText = datas[datas[dataid][dataRowPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
            } else if (datas[dataid][dataColPid]) {
                document.querySelector('td[data-id = "' + datas[dataid][dataColPid] + '"]').innerText = datas[datas[dataid][dataColPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
            }
            console.log("脏单元格数据:");
            printChangeDatas();
            return true;
        }
        return false;
    };

    var cteatrTableTr = function cteatrTableTr(colTree, rowids, datas) {
        var level = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

        var _ref4 = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

        var _ref4$id = _ref4.id;
        var id = _ref4$id === undefined ? 'id' : _ref4$id;
        var _ref4$name = _ref4.name;
        var name = _ref4$name === undefined ? 'name' : _ref4$name;
        var _ref4$pid = _ref4.pid;
        var pid = _ref4$pid === undefined ? 'pid' : _ref4$pid;
        var _ref4$children = _ref4.children;
        var children = _ref4$children === undefined ? 'children' : _ref4$children;

        var trs = '';
        colTree.forEach(function (item) {
            var tds = '',
                display = "table-row";
            // if (isfold) display = "none";
            rowids.forEach(function (rid) {
                var dataid = item[id] + '-' + rid;
                var tdClass = datas[dataid].canedit ? 'edit' + (datas[dataid]["ischange"] ? ' change' : '') : '';
                tds += '<td class="' + tdClass + '" data-id=\'' + dataid + '\'>' + datas[dataid].value + '</td>';
            });
            trs += '<tr data-tr-level=' + level + '><th class="drag drag-bottom">' + item[name] + '</th>' + tds + '</tr>';
        });
        return trs;
    };
    /**
     * 创建表格
     * @param  {array} colTree      tree
     * @param  {array} rowTree      tree
     * @param  {object} options
     * @return {string}             table
     */
    var createTable = function createTable(colTree, rowTree, datas) {
        var _ref5 = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        var _ref5$colid = _ref5.colid;
        var colid = _ref5$colid === undefined ? 'id' : _ref5$colid;
        var _ref5$colName = _ref5.colName;
        var colName = _ref5$colName === undefined ? 'name' : _ref5$colName;
        var _ref5$colpid = _ref5.colpid;
        var colpid = _ref5$colpid === undefined ? 'pid' : _ref5$colpid;
        var _ref5$colchildren = _ref5.colchildren;
        var colchildren = _ref5$colchildren === undefined ? 'children' : _ref5$colchildren;
        var _ref5$colisfold = _ref5.colisfold;
        var colisfold = _ref5$colisfold === undefined ? 'isfold' : _ref5$colisfold;
        var _ref5$rowid = _ref5.rowid;
        var rowid = _ref5$rowid === undefined ? 'id' : _ref5$rowid;
        var _ref5$rowName = _ref5.rowName;
        var rowName = _ref5$rowName === undefined ? 'name' : _ref5$rowName;
        var _ref5$rowpid = _ref5.rowpid;
        var rowpid = _ref5$rowpid === undefined ? 'pid' : _ref5$rowpid;
        var _ref5$rowchildren = _ref5.rowchildren;
        var rowchildren = _ref5$rowchildren === undefined ? 'children' : _ref5$rowchildren;
        var _ref5$rowisfold = _ref5.rowisfold;
        var rowisfold = _ref5$rowisfold === undefined ? 'isfold' : _ref5$rowisfold;

        var tableHead = '<th></th>',
            rowids = [];
        rowTree.forEach(function (item, index) {
            if (item[rowchildren]) {
                tableHead += '<th class="' + (item[rowisfold] ? 'fold' : 'open') + ' drag drag-right"><span class="toggle"  data-toggle="row ' + index + '"></span>' + item[rowName] + '</th>';
                rowids.push(item[rowid]);
                if (!item[rowisfold]) {
                    item[rowchildren].forEach(function (itemc) {
                        tableHead += '<th class="drag drag-right">' + itemc[rowName] + '</th>';
                        rowids.push(itemc[rowid]);
                    });
                }
            } else {
                tableHead += '<th>' + item[rowName] + '</th>';
                rowids.push(item[rowid]);
            }
        });
        tableHead = '<tr>' + tableHead + '</tr>';

        var tableBody = '';
        colTree.forEach(function (item, index) {
            var tds = '';
            if (item[colchildren]) {
                rowids.forEach(function (id) {
                    var dataid = item[colid] + '-' + id;
                    tds += '<td data-id=\'' + dataid + '\'>' + datas[dataid].value + '</td>';
                });
                tableBody += '<tr data-tr-level="0"><th class="' + (item[colisfold] ? 'fold' : 'open') + '  drag drag-bottom"><span class="toggle" data-toggle="col ' + index + '"></span>' + item[colName] + '</th>' + tds + '</tr>';
                if (!item[colisfold]) tableBody += cteatrTableTr(item[colchildren], rowids, datas);
            } else {
                rowids.forEach(function (id) {
                    var dataid = item[colid] + '-' + id;
                    var tdClass = datas[dataid].canedit ? 'edit' + (datas[dataid]["ischange"] ? ' change' : '') : '';
                    tds += '<td  class=' + tdClass + ' data-id=\'' + dataid + '\'>' + datas[dataid].value + '</td>';
                });
                tableBody += '<tr data-tr-level="0"><th class="drag drag-bottom">' + item[colName] + '</th>' + tds + '</tr>';
            }
        });

        return '<table>\n                <thead>\n                    ' + tableHead + '\n                </thead>\n                <tbody>\n                    ' + tableBody + '\n                </tbody>\n            </table>';
    };

    var render = function render() {
        console.log("render...");
        tableCon.innerHTML = createTable(colTree, rowTree, datas);
    };

    // 消息窗口
    var MessageBox = {
        messageBox: null,
        dy: 0,
        dx: 0,
        create: function create(event, target) {
            var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var _ref6$dy = _ref6.dy;
            var dy = _ref6$dy === undefined ? 20 : _ref6$dy;
            var _ref6$dx = _ref6.dx;
            var dx = _ref6$dx === undefined ? 20 : _ref6$dx;

            this.dy = dy;
            this.dx = dx;
            if (!this.messageBox) {
                this.messageBox = document.createElement("div");
                this.messageBox.classList.add("message");
                this.messageBox.style.cssText = 'position: absolute;top: ' + (event.clientY + this.dy) + 'px;left: ' + (event.clientX + this.dx) + 'px;padding: 2px 4px;background-color: rgb(255, 255, 255);font-size: 14px;border: 1px solid #82cc7b;';
            } else {
                this.messageBox.style.top = event.clientY + this.dy + 'px';
                this.messageBox.style.left = event.clientX + this.dx + 'px';
            }
            this.messageBox.innerText = '宽度: ' + target.offsetWidth + 'px';
            document.body.appendChild(this.messageBox);
        },
        set: function set(event, message) {
            this.messageBox.style.top = event.clientY + this.dy + 'px';
            this.messageBox.style.left = event.clientX + this.dx + 'px';
            this.messageBox.innerText = message;
        },
        remove: function remove() {
            if (this.messageBox && document.body === this.messageBox.parentNode) document.body.removeChild(this.messageBox);
        }
    };

    // 输入框
    // const EditIn = {
    //     edit: null,
    //     editIn: null,
    //     editInput:null,
    // }

    var menuToggle = function menuToggle(menu, index) {
        if (menu === 'col') {
            colTree[index]["isfold"] = !colTree[index]["isfold"];
        } else {
            rowTree[index]["isfold"] = !rowTree[index]["isfold"];
        }
        render();
    };

    var TdEdit = {
        target: null,
        dataid: "",
        datavalue: "",
        inp: null,
        confirmBtn: null,
        cancelBtn: null,
        start: function start(target) {
            if (this.target) this.endEdit(this.datavalue);
            console.log("td edit");
            this.target = target;
            this.dataid = target.getAttribute("data-id");
            this.datavalue = datas[this.dataid].value;
            this.target.classList.add("edit-now");

            this.target.innerHTML = '<div class="edit-in edit-' + this.dataid + ' clearfix"><input type="number" value="' + this.datavalue + '" /><div class="edit-in-btns"><div class="top"></div><div class="bottom"></div></div></div>';
            this.inp = document.querySelector('.edit-' + this.dataid + ' input');
            this.confirmBtn = document.querySelector('.edit-' + this.dataid + ' .top');
            this.cancelBtn = document.querySelector('.edit-' + this.dataid + ' .bottom');

            this.confirmBtn.addEventListener("click", this.confirmEdit.bind(this));
            this.inp.addEventListener('keydown', this.confirmEdit.bind(this));
            this.cancelBtn.addEventListener("click", this.endEdit.bind(this));
        },
        confirmEdit: function confirmEdit(e) {
            if (e.keyCode && e.keyCode !== 13) return;
            console.log("confirm edit");
            var event = e || windwo.event;
            var inpValue = this.inp.value;
            if (/^\d+(\.\d*)?$/.test(inpValue)) {
                if (dataUpdate(datas, this.dataid, parseFloat(inpValue))) {
                    this.endEdit();
                }
            } else if (inpValue) {
                this.inp.value = this.datavalue;
                alert("请输入合法数据");
            }
        },
        endEdit: function endEdit(value) {
            console.log("end edit");
            if (value !== undefined) this.target.innerText = this.datavalue;
            this.target.classList.remove("edit-now");
            this.confirmBtn.removeEventListener("click", this.confirmEdit);
            this.inp.removeEventListener('keydown', this.confirmEdit);
            this.cancelBtn.removeEventListener("click", this.endEdit);
            this.target = null;
        }
    };

    var tdDrag = function tdDrag(target, event) {
        console.log("drag");
        // 添加消息窗口
        MessageBox.create(event, target);

        var matchs = target.className.match(/\bdrag-(right|bottom|)/);
        if (!matchs) return;
        var direction = matchs[1];
        var offsetDirection = direction === 'right' ? 'screenX' : 'screenY';

        var startMove = function startMove(target, start, offsetDirection) {
            console.log("drag start");
            var isWidth = offsetDirection === 'screenX';
            var offsetSize = isWidth ? 'offsetWidth' : 'offsetHeight';
            var size = isWidth ? 'min-width' : 'height';

            var oldSize = target[offsetSize];
            var move = function move(e) {
                var event = e || window.event;
                var newSize = oldSize + event[offsetDirection] - start;
                // oldSize = newSize;
                target.style[size] = newSize + 'px';

                // 更新消息窗口
                MessageBox.set(event, (isWidth ? '宽度： ' : '高度： ') + Math.floor(newSize) + 'px');
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            };
            var end = function end(e) {
                var event = e || window.event;
                console.log("drag end");
                // 移除消息窗口
                MessageBox.remove();
                // 解除绑定
                target.classList.remove("drag-start");
                tableCon.removeEventListener("mousemove", move);
                tableCon.removeEventListener("mouseup", end);
                tableCon.removeEventListener("mouseleave", end);
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            };
            target.classList.add("drag-start");
            tableCon.addEventListener("mousemove", move);
            tableCon.addEventListener("mouseup", end);
            tableCon.addEventListener("mouseleave", end);
        };
        startMove(target, event[offsetDirection], offsetDirection);
    };

    var cols = null,
        rows = null,
        colTree = null,
        rowTree = null,
        datas = null,
        tableCon = null;
    var creatExcel = function creatExcel(c, r, id) {
        cols = JSON.parse(JSON.stringify(c));
        rows = JSON.parse(JSON.stringify(r));
        colTree = arrayToTree(cols);
        rowTree = arrayToTree(rows);
        datas = createDatas(cols, rows);

        tableCon = document.getElementById(id);
        render();

        tableCon.addEventListener("click", function (e) {
            var event = e || window.event;
            if (event) {
                var target = event.target || event.srcElement;
                if (target.classList.contains("edit") && !target.classList.contains("edit-now")) {
                    // tdEdit(target);
                    TdEdit.start(target);
                } else if (target.classList.contains("toggle")) {
                    menuToggle.apply(undefined, _toConsumableArray(target.getAttribute("data-toggle").split(" ")));
                }
            }
        });
        tableCon.addEventListener("mousedown", function (e) {
            var event = e || window.event;
            if (event) {
                var target = event.target || event.srcElement;
                if (target.classList.contains("drag-right") && target.offsetWidth - event.offsetX < 20 || target.classList.contains("drag-bottom") && target.offsetHeight - event.offsetY < 20) {
                    tdDrag(target, event);
                }
            }
        });
        tableCon.addEventListener("mousemove", function (e) {
            var event = e || window.event;
            if (event) {
                var target = event.target || event.srcElement;
                if (target.classList.contains("drag-right")) {
                    if (target.offsetWidth - event.offsetX < 20) {
                        target.style.cursor = 'col-resize';
                    } else {
                        target.style.cursor = '';
                    }
                } else if (target.classList.contains("drag-bottom")) {
                    if (target.offsetHeight - event.offsetY < 20) {
                        target.style.cursor = 'row-resize';
                    } else {
                        target.style.cursor = '';
                    }
                }
            }
        });
    };
    window.creatExcel = creatExcel;
})(window);