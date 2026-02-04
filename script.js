// 占卜主程式
document.addEventListener('DOMContentLoaded', function() {
    const divineBtn = document.getElementById('divineBtn');
    const throwInfo = document.getElementById('throwInfo');
    const hexagramArea = document.getElementById('hexagramArea');
    const resultArea = document.getElementById('resultArea');
    const coins = [
        document.getElementById('coin1'),
        document.getElementById('coin2'),
        document.getElementById('coin3')
    ];

    let currentThrow = 0;
    let lines = [];
    let isAnimating = false;

    // 初始化
    function init() {
        currentThrow = 0;
        lines = [];
        isAnimating = false;
        throwInfo.textContent = '';
        resultArea.classList.remove('show');
        resultArea.innerHTML = '';
        divineBtn.disabled = false;
        divineBtn.textContent = '占卜';

        // 清除爻顯示
        for (let i = 1; i <= 6; i++) {
            const row = document.getElementById(`line${i}`);
            row.querySelector('.line-display').className = 'line-display';
            row.querySelector('.line-result').innerHTML = '';
        }

        // 重置硬幣
        coins.forEach(coin => {
            coin.className = 'coin';
        });
    }

    // 擲硬幣動畫
    function flipCoins() {
        return new Promise(resolve => {
            const results = [];

            coins.forEach((coin, index) => {
                // 隨機結果：true = 正面, false = 反面
                const isHeads = Math.random() < 0.5;
                results.push(isHeads);

                // 加入翻轉動畫
                coin.classList.add('flipping');

                setTimeout(() => {
                    coin.classList.remove('flipping');
                    coin.classList.remove('heads', 'tails');
                    coin.classList.add(isHeads ? 'heads' : 'tails');
                }, 500);
            });

            setTimeout(() => resolve(results), 600);
        });
    }

    // 計算爻的結果
    function calculateLine(coinResults) {
        const headsCount = coinResults.filter(r => r).length;

        // 三正面 = 老陽 (9) - 陽爻，會變
        // 三反面 = 老陰 (6) - 陰爻，會變
        // 二正一反 = 少陽 (7) - 陽爻，不變
        // 二反一正 = 少陰 (8) - 陰爻，不變
        let value, isYang, isChanging, name;

        switch (headsCount) {
            case 3: // 三正面 - 老陽
                value = 9;
                isYang = true;
                isChanging = true;
                name = '老陽';
                break;
            case 0: // 三反面 - 老陰
                value = 6;
                isYang = false;
                isChanging = true;
                name = '老陰';
                break;
            case 2: // 二正一反 - 少陽
                value = 7;
                isYang = true;
                isChanging = false;
                name = '少陽';
                break;
            case 1: // 二反一正 - 少陰
                value = 8;
                isYang = false;
                isChanging = false;
                name = '少陰';
                break;
        }

        const coinStr = coinResults.map(r => r ? '正' : '反').join('');

        return { value, isYang, isChanging, name, coinStr };
    }

    // 更新爻顯示
    function updateLineDisplay(lineNum, line) {
        const row = document.getElementById(`line${lineNum}`);
        const display = row.querySelector('.line-display');
        const result = row.querySelector('.line-result');

        display.classList.add(line.isYang ? 'yang' : 'yin');

        // 只顯示動爻標記
        if (line.isChanging) {
            result.innerHTML = '<span class="changing">(*)</span>';
        }
    }

    // 顯示最終結果
    function showResult() {
        const hexagram = getHexagram(lines);
        const changedHexagram = getChangedHexagram(lines);

        let html = `<h2>占卜結果</h2>`;
        html += `<div class="hexagram-name">${hexagram[0]} ${hexagram[1]}卦</div>`;
        html += `<div class="hexagram-description">${hexagram[2]}<br>${hexagram[3]}</div>`;

        // 檢查是否有動爻
        const changingLines = lines.map((l, i) => l.isChanging ? i + 1 : null).filter(x => x);
        if (changingLines.length > 0) {
            const lineNames = ['初', '二', '三', '四', '五', '上'];
            const changingNames = changingLines.map(n => lineNames[n - 1] + '爻').join('、');
            html += `<div class="changing-note">`;
            html += `動爻：${changingNames} (標示 * 處)<br>`;
            if (changedHexagram) {
                html += `變卦：${changedHexagram[0]} ${changedHexagram[1]}卦 (${changedHexagram[2]})`;
            }
            html += `</div>`;
        }

        resultArea.innerHTML = html;
        resultArea.classList.add('show');
    }

    // 執行一次擲卦
    async function doThrow() {
        if (isAnimating) return;
        isAnimating = true;

        currentThrow++;
        throwInfo.textContent = `第 ${currentThrow} 次擲幣...`;
        divineBtn.disabled = true;

        const coinResults = await flipCoins();
        const line = calculateLine(coinResults);
        lines.push(line);

        updateLineDisplay(currentThrow, line);

        throwInfo.textContent = `第 ${currentThrow} 次擲幣完成`;

        if (currentThrow < 6) {
            // 還沒擲完，繼續下一次
            setTimeout(() => {
                isAnimating = false;
                doThrow();
            }, 800);
        } else {
            // 擲完六次，顯示結果
            setTimeout(() => {
                showResult();
                divineBtn.textContent = '重新占卜';
                divineBtn.disabled = false;
                isAnimating = false;
            }, 500);
        }
    }

    // 占卜按鈕點擊
    divineBtn.addEventListener('click', function() {
        if (currentThrow >= 6) {
            // 重新開始
            init();
            setTimeout(doThrow, 300);
        } else if (currentThrow === 0) {
            // 開始占卜
            doThrow();
        }
    });

    // 頁面載入時初始化
    init();
});
