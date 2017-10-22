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

    const dataUpdate = (datas, dataid, value, {
        dataColPid = 'colpid',
        dataRowPid = 'rowpid',
    } = {}) => {
        const dValue = value - datas[dataid].value;
        if (dValue) {
            datas[dataid].value = value;
            datas[dataid].ischange = true;
            if (datas[dataid][dataColPid] && datas[dataid][dataRowPid]) {
                datas[datas[dataid][dataColPid]].value += dValue;
                datas[datas[dataid][dataRowPid]].value += dValue;
                datas[datas[datas[dataid][dataColPid]][dataRowPid]].value += dValue;
            } else if (datas[dataid][dataRowPid]) {
                datas[datas[dataid][dataRowPid]].value += dValue;
            } else if (datas[dataid][dataColPid]) {
                datas[datas[dataid][dataColPid]].value += dValue;
            }
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
                this.messageBox.style = `position: absolute;top: ${event.clientY + this.dy}px;left: ${event.clientX + this.dx}px;padding: 2px 4px;background-color: rgb(255, 255, 255);font-size: 14px;border: 1px solid #82cc7b;`;
            } else {
                this.messageBox.style.top = (event.clientY + this.dy) + 'px';
                this.messageBox.style.left = (event.clientX + this.dx) + 'px';
            }
            this.messageBox.innerHTML = '宽度: ' + target.offsetWidth + 'px';
            document.body.appendChild(this.messageBox);
        },
        set(event, message) {
            this.messageBox.style.top = (event.clientY + this.dy) + 'px';
            this.messageBox.style.left = (event.clientX + this.dx) + 'px';
            this.messageBox.innerHTML = message;
            console.log(message);
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


    const tdEdit = (target) => {
        console.log("td edit");

        const dataid = target.getAttribute("data-id");
        const datavalue = datas[dataid].value;
        target.classList.add("edit-now");
        target.classList.remove("change");

        target.innerHTML = `<div class="edit-in edit-${dataid} clearfix"><input type="number" autofocus="autofocus" value="${datavalue}" /><div class="edit-in-btns"><div class="top"></div><div class="bottom"></div></div></div>`;
        const inp = document.querySelector(`.edit-${dataid} input`);
        const confirmBtn = document.querySelector(`.edit-${dataid} .top`);
        const cancelBtn = document.querySelector(`.edit-${dataid} .bottom`);

        const confirmEdit = (e) => {
            if (e.keyCode && e.keyCode !== 13) return;
            console.log("confirm edit");
            const event = e || windwo.event;
            const inpValue = inp.value;
            if (/^\d+(.\d*)?$/.test(inpValue)) {
                if (dataUpdate(datas, dataid, parseFloat(inpValue))) {
                    endEdit();
                }
            } else if (inpValue) {
                inp.value = datavalue;
                alert("请输入合法数据");
            }
        };

        const cancelEdit = (e) => {
            const event = e || windwo.event;
            console.log("cancel edit");
            endEdit();
        }

        const endEdit = () => {
            confirmBtn.removeEventListener("click", confirmEdit);
            cancelBtn.removeEventListener("click", cancelEdit);
            render();
            // target.innerHTML = datas[dataid].value;
            // target.classList.remove("edit-now");
        };

        confirmBtn.addEventListener("click", confirmEdit);
        inp.addEventListener('keydown', confirmEdit);
        cancelBtn.addEventListener("click", cancelEdit);
    };

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
            const move = function (e) {
                const event = e || window.event;
                let newSize = oldSize + e[offsetDirection] - start;
                target.style[size] = newSize + 'px';

                // 更新消息窗口
                MessageBox.set(event, (isWidth ? '宽度： ' : '高度： ') + newSize + 'px');
            }
            const end = function (e) {
                const event = e || window.event;
                console.log("drag end");
                // 移除消息窗口
                MessageBox.remove();
                // 解除绑定
                target.classList.remove("drag-start");
                target.removeEventListener("mousemove", move);
                target.removeEventListener("mouseup", end);
                target.removeEventListener("mouseout", end);
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

        tableCon.addEventListener("click", function (e) {
            const event = e || window.event;
            if (event) {
                const target = event.target;
                if (target.classList.contains("edit") && !target.classList.contains("edit-now")) {
                    tdEdit(target);
                } else if (target.classList.contains("toggle")) {
                    menuToggle(...(target.getAttribute("data-toggle").split(" ")));
                }
            }
        });
        tableCon.addEventListener("mousedown", function (e) {
            const event = e || window.event;
            if (event) {
                const target = event.target;
                if (target.classList.contains("drag")) {
                    tdDrag(target, event);
                }
            }
        });
    };
    window.creatExcel = creatExcel;
})(window)