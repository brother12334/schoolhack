var _0xcbf1 = ["\x23\x63\x6F\x6E\x74\x65\x6E\x74\x2D\x73\x74\x61\x72\x74", "\x71\x75\x65\x72\x79\x53\x65\x6C\x65\x63\x74\x6F\x72", "\x23\x64\x6F\x67", "\x23\x63\x6F\x6E\x74\x65\x6E\x74\x2D\x65\x6E\x64", "\x23\x68\x61\x70\x70\x79\x64\x6F\x67", "\x64\x69\x73\x70\x6C\x61\x79", "\x73\x74\x79\x6C\x65", "\x6E\x6F\x6E\x65", "\x77\x68\x69\x63\x68", "\x6B\x65\x79\x64\x6F\x77\x6E", "\x62\x6F\x64\x79", "\x6B\x65\x79\x63\x6F\x64\x65", "\x65\x76\x65\x6E\x74", "\x70\x72\x65\x76\x65\x6E\x74\x44\x65\x66\x61\x75\x6C\x74", "\x61\x64\x64\x45\x76\x65\x6E\x74\x4C\x69\x73\x74\x65\x6E\x65\x72", "\x6B\x65\x79\x75\x70", "\x72\x61\x63\x65\x72", "\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x42\x79\x49\x64", "\x6C\x65\x66\x74", "\x70\x78", "\x62\x6C\x6F\x63\x6B", "\x66\x6C\x65\x78", "\x77\x69\x64\x74\x68", "\x69\x6E\x6E\x65\x72\x57\x69\x64\x74\x68", "\x67\x61\x6D\x65\x63\x6F\x6E\x74\x61\x69\x6E\x65\x72", "\x73\x63\x72\x6F\x6C\x6C\x59", "\x74\x6F\x70", "\x67\x65\x74\x42\x6F\x75\x6E\x64\x69\x6E\x67\x43\x6C\x69\x65\x6E\x74\x52\x65\x63\x74", "\x23\x72\x61\x63\x65\x72", "\x73\x63\x72\x6F\x6C\x6C\x58", "\x72\x69\x67\x68\x74", "\x23\x67\x61\x6D\x65\x63\x6F\x6E\x74\x61\x69\x6E\x65\x72", "\x72\x61\x63\x65\x72\x78\x20\x3A", "\x20\x72\x61\x63\x65\x72\x59\x20\x3A", "\x6C\x6F\x67", "\x67\x61\x6D\x65\x61\x72\x65\x61\x78\x20\x3A", "\x20\x67\x59\x20", "\x64\x6F\x67\x78\x20\x3A\x20", "\x47\x61\x6D\x65\x20\x4F\x76\x65\x72", "\x6E\x6F\x77", "\x74\x65\x78\x74", "\x23\x74\x69\x6D\x65", "\x74\x6F\x46\x69\x78\x65\x64"];
var gameStarted = false;
var gameEnded = false;
var startTime = 0;
var endTime = 0;
var startcontent = document[_0xcbf1[1]](_0xcbf1[0]);
var dog = document[_0xcbf1[1]](_0xcbf1[2]);
var endcontent = document[_0xcbf1[1]](_0xcbf1[3]);
var happydog = document[_0xcbf1[1]](_0xcbf1[4]);

function start() { startcontent[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[7];
    happydog[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[7];
    $(_0xcbf1[10])[_0xcbf1[9]](function _0x3279xa(_0x3279xb) { if (_0x3279xb[_0xcbf1[8]] == 32 && !gameStarted) { stopwatch(1, 0);
            gameStarted = true } }) }
window[_0xcbf1[14]](_0xcbf1[9], function keydown(_0x3279xd) { var _0x3279xe = _0x3279xd[_0xcbf1[8]] || window[_0xcbf1[12]][_0xcbf1[11]]; if (_0x3279xe == 37 || _0x3279xe == 39 || _0x3279xe == 32) { _0x3279xd[_0xcbf1[13]]() } });
document[_0xcbf1[14]](_0xcbf1[15], function(_0x3279xd) { if (_0x3279xd[_0xcbf1[8]] === 32 && gameStarted && !gameEnded) { moveRacer() } else { if (_0x3279xd[_0xcbf1[8]] == 82 && gameEnded) { gameStarted = false;
            gameEnded = false;
            startTime = 0;
            endTime = 0; var _0x3279xf = document[_0xcbf1[17]](_0xcbf1[16]);
            _0x3279xf[_0xcbf1[6]][_0xcbf1[18]] = 41 + _0xcbf1[19];
            start() } } });

function restart() { if (gameEnded) { gameStarted = false;
        gameEnded = false;
        startTime = 0;
        endTime = 0; var _0x3279xf = document[_0xcbf1[17]](_0xcbf1[16]);
        _0x3279xf[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[20];
        dog[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[21];
        endcontent[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[7];
        _0x3279xf[_0xcbf1[6]][_0xcbf1[18]] = 41 + _0xcbf1[19];
        start() } }

function moveRacer() { var _0x3279x12 = $(document)[_0xcbf1[22]]() / 100; var _0x3279xf = document[_0xcbf1[17]](_0xcbf1[16]); var _0x3279x13 = _0x3279xf[_0xcbf1[6]][_0xcbf1[18]];
    _0x3279xf[_0xcbf1[6]][_0xcbf1[18]] = parseInt(_0x3279x13) + _0x3279x12 + _0xcbf1[19];
    stopwatch(0, 0); var _0x3279x14 = parseInt(_0x3279xf[_0xcbf1[6]][_0xcbf1[18]]) + parseInt(_0x3279xf[_0xcbf1[6]][_0xcbf1[22]]); var _0x3279x15 = document[_0xcbf1[17]](_0xcbf1[24])[_0xcbf1[23]]; var _0x3279x16 = window[_0xcbf1[25]] + document[_0xcbf1[1]](_0xcbf1[28])[_0xcbf1[27]]()[_0xcbf1[26]]; var _0x3279x17 = window[_0xcbf1[29]] + document[_0xcbf1[1]](_0xcbf1[28])[_0xcbf1[27]]()[_0xcbf1[18]]; var _0x3279x18 = window[_0xcbf1[29]] + document[_0xcbf1[1]](_0xcbf1[2])[_0xcbf1[27]]()[_0xcbf1[18]]; var _0x3279x19 = window[_0xcbf1[29]] + document[_0xcbf1[1]](_0xcbf1[31])[_0xcbf1[27]]()[_0xcbf1[30]]; var _0x3279x1a = window[_0xcbf1[25]] + document[_0xcbf1[1]](_0xcbf1[31])[_0xcbf1[27]]()[_0xcbf1[26]];
    console[_0xcbf1[34]](_0xcbf1[32] + _0x3279x17 + _0xcbf1[33] + _0x3279x16);
    console[_0xcbf1[34]](_0xcbf1[35] + _0x3279x19 + _0xcbf1[36] + _0x3279x1a);
    console[_0xcbf1[34]](_0xcbf1[37] + _0x3279x18); if (_0x3279x17 >= _0x3279x18) { console[_0xcbf1[34]](_0xcbf1[38]);
        _0x3279xf[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[7];
        stopwatch(0, 1);
        gameOver() } }

function stopwatch(start, _0x3279x1c) { if (start == 1) { startTime = Date[_0xcbf1[39]]() } else { if (_0x3279x1c == 1) { endTime = Date[_0xcbf1[39]]() } }; var _0x3279x1d = Date[_0xcbf1[39]]();
    $(_0xcbf1[41])[_0xcbf1[40]]((_0x3279x1d - startTime) / 1000);
    console[_0xcbf1[34]]((_0x3279x1d - startTime) / 1000); if (startTime != 0 && endTime != 0) { var _0x3279x1e = (endTime - startTime) / 1000;
        completionTime2 = _0x3279x1e[_0xcbf1[42]](1);
        $(_0xcbf1[41])[_0xcbf1[40]](completionTime2);
        console[_0xcbf1[34]](_0x3279x1e) } }

function gameOver() { endcontent[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[20];
    happydog[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[21];
    dog[_0xcbf1[6]][_0xcbf1[5]] = _0xcbf1[7];
    gameEnded = true }