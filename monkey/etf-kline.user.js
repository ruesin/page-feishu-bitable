// ==UserScript==
// @name        ETF K线
// @match       *://pa65zg4ajd.feishu.cn/wiki/ANszw062di0JdjkhuLIclM4wn0e
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM.xmlHttpRequest
// @charset		UTF-8
// @license     GPL License
// @require     https://greasyfork.org/scripts/471561-sinhelper/code/SinHelper.js?version=1260860
// ==/UserScript==

(function () {
    'use strict';

    const sinHelper = window.sinHelper || {}

    let getMaps = (columns) => {
        let maps = [
            {key: 'timestamp', name: '日期', index: -1},
            {key: 'open', name: '开盘价', index: -1},
            {key: 'high', name: '最高价', index: -1},
            {key: 'low', name: '最低价', index: -1},
            {key: 'close', name: '收盘价', index: -1},
            {key: 'chg', name: '涨跌', index: -1},
            {key: 'percent', name: '涨跌幅', index: -1},
            {key: 'volume', name: '成交量', index: -1},
            {key: 'amount', name: '成交额', index: -1},
        ];

        let result = [];
        // ['bbb', 'aaa', 'ccc'].indexOf('aaa')
        maps.forEach((item) => {
            let index = columns.indexOf(item['key']);
            if (index < 0 ) {
                alert(`${item['key']} not found`);
                throw new Error(`${item['key']} not found`);
            }
            item['index'] = index;
            result.push(item)
        });
        return result;
    };
    
    let format = (value) => {
        // 从 “column” 确定需要的字段key是几
        // 遍历 “item” 时直接取对应的key
        let _json = JSON.parse(value);
        let maps = getMaps(_json['data']['column']);
        let cellList = [], headerList = [];
        _json['data']['item'].forEach((item) => {
            let index = item['index'], _datum = [];
            maps.forEach((mp) => {
                let val = item[mp['index']];
                if (mp['key'] === 'timestamp') val = sinHelper.Time.format(val, 'yyyy-MM-dd')
                _datum.push(val)
            });
            cellList.push(_datum);
        });
        maps.forEach((mp) => {
            headerList.push(mp['name'])
        });
        sinHelper.Excel.exportExcelFromFront({
            cellList: cellList,
            headerList: headerList,
            exportName: 'ETF K线'
        });
    };

    let render = function () {
        let _this = this
        let boxStyle = 'position: fixed;right: 16px;bottom: 50px;display: inline-block;background: green;color: #fff;font-size: 14px;line-height: 30px;text-align: center;min-width: 40px;min-height: 30px;border-radius: 16px;z-index: 999999;';
        let textStyle = `width:200px; height:100px; resize:none;`;
        var html = `<div style="${boxStyle}">\n` 
        + `<textarea id="sin_etf_kline_text" rows="5" style="${textStyle}"></textarea>` 
        + `<div><button id="sin_etf_kline_btn">格式化</button></div>`
        + '</div>\n';
        let _boxnode = document.createElement("div")
        _boxnode.id = 'sin_etf_kline_id';
        _boxnode.innerHTML = html;
        document.getElementsByTagName("body")[0].appendChild(_boxnode);

        document.getElementById('sin_etf_kline_btn').onclick = function () {
            const textarea = document.getElementById("sin_etf_kline_text");
            const value = textarea.value;
            format(value);
        }
    }

    render();
})();