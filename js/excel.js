(function(window) {
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

    const arrayToTree = (array, {
        id = 'id',
        pid = 'pid',
        children = 'children',
        isfold = 'isfold',
    } = {}) => {
        let data = JSON.parse(JSON.stringify(array));
        // let data = array;
        let result = [];
        let hash = {};
        data.forEach((item, index) => {
            hash[data[index][id]] = data[index];
        });

        data.forEach((item) => {
            let hashVP = hash[item[pid]];
            if (hashVP) {
                if (!hashVP[children]) {
                    hashVP[children] = [];
                    hashVP[isfold] = false;
                }
                hashVP[children].push(item);
            } else {
                result.push(item);
            }
        })
        return result;
    };

    const createDatas = (cols, rows, {
        colid = 'id',
        colpid = 'pid',
        rowid = 'id',
        rowpid = 'pid',
        dataColPid = 'colpid',
        dataRowPid = 'rowpid',
    } = {}) => {
        var datas = {};
        cols.forEach((col) => {
            rows.forEach((row) => {

                let did = `${col[colid]}-${row[rowid]}`;
                datas[did] = {
                    value: 0,
                    canedit: false,
                    [dataColPid]: col[colpid] ? `${col[colpid]}-${row[rowid]}` : "",
                    [dataRowPid]: row[rowpid] ? `${col[colid]}-${row[rowpid]}` : "",
                    ischange: false,
                };

                if (col[colpid] && row[rowpid]) {
                    datas[did]["canedit"] = true;
                }
            })
        })
        return datas;
    };

    /**
     * 打印脏数据
     */
    const printChangeDatas = () => {
        var changes = [];
        for (var key in datas) {　　
            if (datas.hasOwnProperty(key) && datas[key].ischange) {　　　　
                changes.push({
                    id: key,
                    value: datas[key].value,
                });
            }
        }
        console.log(changes);
    }

    const dataUpdate = (datas, dataid, value, {
        dataColPid = 'colpid',
        dataRowPid = 'rowpid',
    } = {}) => {
        const dValue = value - datas[dataid].value;
        if (dValue) {
            document.querySelector(`td[data-id = "${dataid}"]`).innerText = datas[dataid].value = value;
            document.querySelector(`td[data-id = "${dataid}"]`).classList.add("change");
            datas[dataid].ischange = true;
            if (datas[dataid][dataColPid] && datas[dataid][dataRowPid]) {
                document.querySelector(`td[data-id = "${datas[dataid][dataColPid]}"]`).innerText = datas[datas[dataid][dataColPid]].value += dValue;
                datas[datas[dataid][dataColPid]].ischange = true;
                document.querySelector(`td[data-id = "${datas[dataid][dataRowPid]}"]`).innerText = datas[datas[dataid][dataRowPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
                document.querySelector(`td[data-id = "${datas[datas[dataid][dataColPid]][dataRowPid]}"]`).innerText = datas[datas[datas[dataid][dataColPid]][dataRowPid]].value += dValue;
                datas[datas[datas[dataid][dataColPid]][dataRowPid]].ischange = true;
            } else if (datas[dataid][dataRowPid]) {
                document.querySelector(`td[data-id = "${datas[dataid][dataRowPid]}"]`).innerText = datas[datas[dataid][dataRowPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
            } else if (datas[dataid][dataColPid]) {
                document.querySelector(`td[data-id = "${datas[dataid][dataColPid]}"]`).innerText = datas[datas[dataid][dataColPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].ischange = true;
            }
            console.log("脏单元格数据:");
            printChangeDatas();
            return true;
        }
        return false;
    };

    const cteatrTableTr = (colTree, rowids, datas, level = 1, {
        id = 'id',
        name = 'name',
        pid = 'pid',
        children = 'children',
    } = {}) => {

        let trs = '';
        colTree.forEach((item) => {
            let tds = '',
                display = "table-row";
            // if (isfold) display = "none";
            rowids.forEach((rid) => {
                const dataid = `${item[id]}-${rid}`;
                const tdClass = datas[dataid].canedit ? ('edit' + (datas[dataid]["ischange"] ? ' change' : '')) : '';
                tds += `<td class="${tdClass}" data-id='${dataid}'>${datas[dataid].value}</td>`;
            });
            trs += `<tr data-tr-level=${level}><th class="drag drag-bottom">${item[name]}</th>${tds}</tr>`;
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
    const createTable = (colTree, rowTree, datas, {
        colid = 'id',
        colName = 'name',
        colpid = 'pid',
        colchildren = 'children',
        colisfold = 'isfold',
        rowid = 'id',
        rowName = 'name',
        rowpid = 'pid',
        rowchildren = 'children',
        rowisfold = 'isfold',
    } = {}) => {

        let tableHead = '<th></th>',
            rowids = [];
        rowTree.forEach((item, index) => {
            if (item[rowchildren]) {
                tableHead += `<th class="${item[rowisfold] ? 'fold' : 'open'} drag drag-right"><span class="toggle"  data-toggle="row ${index}"></span>${item[rowName]}</th>`;
                rowids.push(item[rowid]);
                if (!item[rowisfold]) {
                    item[rowchildren].forEach((itemc) => {
                        tableHead += `<th class="drag drag-right">${itemc[rowName]}</th>`;
                        rowids.push(itemc[rowid]);
                    });
                }
            } else {
                tableHead += `<th>${item[rowName]}</th>`;
                rowids.push(item[rowid]);
            }
        });
        tableHead = `<tr>${tableHead}</tr>`;

        let tableBody = '';
        colTree.forEach((item, index) => {
            let tds = '';
            if (item[colchildren]) {
                rowids.forEach((id) => {
                    const dataid = `${item[colid]}-${id}`
                    tds += `<td data-id='${dataid}'>${datas[dataid].value}</td>`;
                });
                tableBody += `<tr data-tr-level="0"><th class="${item[colisfold] ? 'fold' : 'open'}  drag drag-bottom"><span class="toggle" data-toggle="col ${index}"></span>${item[colName]}</th>${tds}</tr>`;
                if (!item[colisfold]) tableBody += cteatrTableTr(item[colchildren], rowids, datas);
            } else {
                rowids.forEach((id) => {
                    const dataid = `${item[colid]}-${id}`;
                    const tdClass = datas[dataid].canedit ? ('edit' + (datas[dataid]["ischange"] ? ' change' : '')) : '';
                    tds += `<td  class=${tdClass} data-id='${dataid}'>${datas[dataid].value}</td>`;
                });
                tableBody += `<tr data-tr-level="0"><th class="drag drag-bottom">${item[colName]}</th>${tds}</tr>`;
            }
        })

        return (
            `<table>
                <thead>
                    ${tableHead}
                </thead>
                <tbody>
                    ${tableBody}
                </tbody>
            </table>`
        );
    };

    const render = () => {
        console.log("render...");
        tableCon.innerHTML = createTable(colTree, rowTree, datas);
    };

    // 消息窗口
    const MessageBox = {
        messageBox: null,
        dy: 0,
        dx: 0,
        create(event, target, {
            dy = 20,
            dx = 20,
        } = {}) {
            this.dy = dy;
            this.dx = dx;
            if (!this.messageBox) {
                this.messageBox = document.createElement("div");
                this.messageBox.classList.add("message");
                this.messageBox.style.cssText = `position: absolute;top: ${event.clientY + this.dy}px;left: ${event.clientX + this.dx}px;padding: 2px 4px;background-color: rgb(255, 255, 255);font-size: 14px;border: 1px solid #82cc7b;`;
            } else {
                this.messageBox.style.top = (event.clientY + this.dy) + 'px';
                this.messageBox.style.left = (event.clientX + this.dx) + 'px';
            }
            this.messageBox.innerText = '宽度: ' + target.offsetWidth + 'px';
            document.body.appendChild(this.messageBox);
        },
        set(event, message) {
            this.messageBox.style.top = (event.clientY + this.dy) + 'px';
            this.messageBox.style.left = (event.clientX + this.dx) + 'px';
            this.messageBox.innerText = message;
        },
        remove() {
            if (this.messageBox && document.body === this.messageBox.parentNode) document.body.removeChild(this.messageBox);
        },
    };

    // 输入框
    // const EditIn = {
    //     edit: null,
    //     editIn: null,
    //     editInput:null,
    // }

    const menuToggle = (menu, index) => {
        if (menu === 'col') {
            colTree[index]["isfold"] = !colTree[index]["isfold"];
        } else {
            rowTree[index]["isfold"] = !rowTree[index]["isfold"];
        }
        render();
    };


    // const tdEdit = (target) => {
    //     console.log("td edit");

    //     const dataid = target.getAttribute("data-id");
    //     const datavalue = datas[dataid].value;
    //     target.classList.add("edit-now");
    //     target.classList.remove("change");

    //     target.innerHTML = `<div class="edit-in edit-${dataid} clearfix"><input type="number" autofocus="autofocus" value="${datavalue}" /><div class="edit-in-btns"><div class="top"></div><div class="bottom"></div></div></div>`;
    //     const inp = document.querySelector(`.edit-${dataid} input`);
    //     const confirmBtn = document.querySelector(`.edit-${dataid} .top`);
    //     const cancelBtn = document.querySelector(`.edit-${dataid} .bottom`);

    //     const confirmEdit = (e) => {
    //         if (e.keyCode && e.keyCode !== 13) return;
    //         console.log("confirm edit");
    //         const event = e || windwo.event;
    //         const inpValue = inp.value;
    //         if (/^\d+(.\d*)?$/.test(inpValue)) {
    //             if (dataUpdate(datas, dataid, parseFloat(inpValue))) {
    //                 endEdit();
    //             }
    //         } else if (inpValue) {
    //             inp.value = datavalue;
    //             alert("请输入合法数据");
    //         }
    //     };

    //     const cancelEdit = (e) => {
    //         const event = e || windwo.event;
    //         console.log("cancel edit");
    //         endEdit();
    //     }

    //     const endEdit = () => {
    //         confirmBtn.removeEventListener("click", confirmEdit);
    //         cancelBtn.removeEventListener("click", cancelEdit);
    //         render();
    //         // target.innerHTML = datas[dataid].value;
    //         // target.classList.remove("edit-now");
    //     };

    //     confirmBtn.addEventListener("click", confirmEdit);
    //     inp.addEventListener('keydown', confirmEdit);
    //     cancelBtn.addEventListener("click", cancelEdit);
    // };

    const TdEdit = {
        target: null,
        dataid: "",
        datavalue: "",
        inp: null,
        confirmBtn: null,
        cancelBtn: null,
        start(target) {
            if (this.target) this.endEdit(this.datavalue);
            console.log("td edit");
            this.target = target;
            this.dataid = target.getAttribute("data-id");
            this.datavalue = datas[this.dataid].value;
            this.target.classList.add("edit-now");

            this.target.innerHTML = `<div class="edit-in edit-${this.dataid} clearfix"><input type="number" value="${this.datavalue}" /><div class="edit-in-btns"><div class="top"></div><div class="bottom"></div></div></div>`;
            this.inp = document.querySelector(`.edit-${this.dataid} input`);
            this.confirmBtn = document.querySelector(`.edit-${this.dataid} .top`);
            this.cancelBtn = document.querySelector(`.edit-${this.dataid} .bottom`);

            this.confirmBtn.addEventListener("click", this.confirmEdit.bind(this));
            this.inp.addEventListener('keydown', this.confirmEdit.bind(this));
            this.cancelBtn.addEventListener("click", this.endEdit.bind(this));
        },
        confirmEdit(e) {
            if (e.keyCode && e.keyCode !== 13) return;
            console.log("confirm edit");
            const event = e || windwo.event;
            const inpValue = this.inp.value;
            if (/^\d+(\.\d*)?$/.test(inpValue)) {
                if (dataUpdate(datas, this.dataid, parseFloat(inpValue))) {
                    this.endEdit();
                }
            } else if (inpValue) {
                this.inp.value = this.datavalue;
                alert("请输入合法数据");
            }
        },
        endEdit(value) {
            console.log("end edit");
            if (value !== undefined) this.target.innerText = this.datavalue;
            this.target.classList.remove("edit-now");
            this.confirmBtn.removeEventListener("click", this.confirmEdit);
            this.inp.removeEventListener('keydown', this.confirmEdit);
            this.cancelBtn.removeEventListener("click", this.endEdit);
            this.target = null;
        },
    }


    const tdDrag = (target, event) => {
        console.log("drag");
        // 添加消息窗口
        MessageBox.create(event, target);


        const matchs = target.className.match(/\bdrag-(right|bottom|)/);
        if (!matchs) return;
        const direction = matchs[1];
        const offsetDirection = direction === 'right' ? 'offsetX' : 'offsetY';

        const startMove = (target, start, offsetDirection) => {
            console.log("drag start");
            const isWidth = offsetDirection === 'offsetX';
            const offsetSize = isWidth ? 'offsetWidth' : 'offsetHeight';
            const size = isWidth ? 'min-width' : 'height';

            const oldSize = target[offsetSize];
            const move = function(e) {
                const event = e || window.event;
                let newSize = oldSize + event[offsetDirection] - start;
                target.style[size] = newSize + 'px';

                // 更新消息窗口
                MessageBox.set(event, (isWidth ? '宽度： ' : '高度： ') + Math.floor(newSize) + 'px');
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            }
            const end = function(e) {
                const event = e || window.event;
                console.log("drag end");
                // 移除消息窗口
                MessageBox.remove();
                // 解除绑定
                target.classList.remove("drag-start");
                target.removeEventListener("mousemove", move);
                target.removeEventListener("mouseup", end);
                target.removeEventListener("mouseout", end);
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            }
            target.classList.add("drag-start");
            target.addEventListener("mousemove", move);
            target.addEventListener("mouseup", end);
            target.addEventListener("mouseout", end);
        }
        startMove(target, event[offsetDirection], offsetDirection);
    };

    let cols = null,
        rows = null,
        colTree = null,
        rowTree = null,
        datas = null,
        tableCon = null;
    const creatExcel = (c, r, id) => {
        cols = JSON.parse(JSON.stringify(c));
        rows = JSON.parse(JSON.stringify(r));
        colTree = arrayToTree(cols);
        rowTree = arrayToTree(rows);
        datas = createDatas(cols, rows);

        tableCon = document.getElementById(id);
        render();

        tableCon.addEventListener("click", function(e) {
            const event = e || window.event;
            if (event) {
                const target = event.target || event.srcElement;
                if (target.classList.contains("edit") && !target.classList.contains("edit-now")) {
                    // tdEdit(target);
                    TdEdit.start(target);
                } else if (target.classList.contains("toggle")) {
                    menuToggle(...(target.getAttribute("data-toggle").split(" ")));
                }
            }
        });
        tableCon.addEventListener("mousedown", function(e) {
            const event = e || window.event;
            if (event) {
                const target = event.target || event.srcElement;
                if ((target.classList.contains("drag-right") && target.offsetWidth - event.offsetX < 20) || (target.classList.contains("drag-bottom") && target.offsetHeight - event.offsetY < 20)) {
                    tdDrag(target, event);
                }
            }
        });
        tableCon.addEventListener("mousemove", function(e) {
            const event = e || window.event;
            if (event) {
                const target = event.target || event.srcElement;
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
})(window)