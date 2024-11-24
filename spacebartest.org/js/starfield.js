var _0xdd42 = ["\x66\x70\x73", "\x63\x61\x6E\x76\x61\x73", "\x77\x69\x64\x74\x68", "\x6D\x69\x6E\x56\x65\x6C\x6F\x63\x69\x74\x79", "\x6D\x61\x78\x56\x65\x6C\x6F\x63\x69\x74\x79", "\x73\x74\x61\x72\x73", "\x69\x6E\x74\x65\x72\x76\x61\x6C\x49\x64", "\x69\x6E\x69\x74\x69\x61\x6C\x69\x73\x65", "\x70\x72\x6F\x74\x6F\x74\x79\x70\x65", "\x63\x6F\x6E\x74\x61\x69\x6E\x65\x72\x44\x69\x76", "\x69\x6E\x6E\x65\x72\x57\x69\x64\x74\x68", "\x68\x65\x69\x67\x68\x74", "\x69\x6E\x6E\x65\x72\x48\x65\x69\x67\x68\x74", "\x6F\x6E\x72\x65\x73\x69\x7A\x65", "\x64\x72\x61\x77", "\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74", "\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64", "\x73\x74\x61\x72\x74", "\x72\x61\x6E\x64\x6F\x6D", "\x75\x70\x64\x61\x74\x65", "\x73\x74\x6F\x70", "\x6C\x65\x6E\x67\x74\x68", "\x79", "\x76\x65\x6C\x6F\x63\x69\x74\x79", "\x32\x64", "\x67\x65\x74\x43\x6F\x6E\x74\x65\x78\x74", "\x66\x69\x6C\x6C\x53\x74\x79\x6C\x65", "\x23\x30\x30\x30\x30\x30\x30", "\x66\x69\x6C\x6C\x52\x65\x63\x74", "\x23\x66\x66\x66\x66\x66\x66", "\x78", "\x73\x69\x7A\x65"];

function Starfield() { this[_0xdd42[0]] = 30;
    this[_0xdd42[1]] = null;
    this[_0xdd42[2]] = 0;
    this[_0xdd42[2]] = 0;
    this[_0xdd42[3]] = 15;
    this[_0xdd42[4]] = 30;
    this[_0xdd42[5]] = 100;
    this[_0xdd42[6]] = 0 }
Starfield[_0xdd42[8]][_0xdd42[7]] = function(_0x2107x2) { var _0x2107x3 = this;
    this[_0xdd42[9]] = _0x2107x2;
    _0x2107x3[_0xdd42[2]] = window[_0xdd42[10]];
    _0x2107x3[_0xdd42[11]] = window[_0xdd42[12]];
    window[_0xdd42[13]] = function(_0x2107x4) { _0x2107x3[_0xdd42[2]] = window[_0xdd42[10]];
        _0x2107x3[_0xdd42[11]] = window[_0xdd42[12]];
        _0x2107x3[_0xdd42[1]][_0xdd42[2]] = _0x2107x3[_0xdd42[2]];
        _0x2107x3[_0xdd42[1]][_0xdd42[11]] = _0x2107x3[_0xdd42[11]];
        _0x2107x3[_0xdd42[14]]() }; var _0x2107x5 = document[_0xdd42[15]](_0xdd42[1]);
    _0x2107x2[_0xdd42[16]](_0x2107x5);
    this[_0xdd42[1]] = _0x2107x5;
    this[_0xdd42[1]][_0xdd42[2]] = this[_0xdd42[2]];
    this[_0xdd42[1]][_0xdd42[11]] = this[_0xdd42[11]] };
Starfield[_0xdd42[8]][_0xdd42[17]] = function() { var _0x2107x6 = []; for (var _0x2107x7 = 0; _0x2107x7 < this[_0xdd42[5]]; _0x2107x7++) { _0x2107x6[_0x2107x7] = new Star(Math[_0xdd42[18]]() * this[_0xdd42[2]], Math[_0xdd42[18]]() * this[_0xdd42[11]], Math[_0xdd42[18]]() * 3 + 1, (Math[_0xdd42[18]]() * (this[_0xdd42[4]] - this[_0xdd42[3]])) + this[_0xdd42[3]]) };
    this[_0xdd42[5]] = _0x2107x6; var _0x2107x3 = this;
    this[_0xdd42[6]] = setInterval(function() { _0x2107x3[_0xdd42[19]]();
        _0x2107x3[_0xdd42[14]]() }, 1000 / this[_0xdd42[0]]) };
Starfield[_0xdd42[8]][_0xdd42[20]] = function() { clearInterval(this[_0xdd42[6]]) };
Starfield[_0xdd42[8]][_0xdd42[19]] = function() { var _0x2107x8 = 1 / this[_0xdd42[0]]; for (var _0x2107x7 = 0; _0x2107x7 < this[_0xdd42[5]][_0xdd42[21]]; _0x2107x7++) { var _0x2107x9 = this[_0xdd42[5]][_0x2107x7];
        _0x2107x9[_0xdd42[22]] += _0x2107x8 * _0x2107x9[_0xdd42[23]]; if (_0x2107x9[_0xdd42[22]] > this[_0xdd42[11]]) { this[_0xdd42[5]][_0x2107x7] = new Star(Math[_0xdd42[18]]() * this[_0xdd42[2]], 0, Math[_0xdd42[18]]() * 3 + 1, (Math[_0xdd42[18]]() * (this[_0xdd42[4]] - this[_0xdd42[3]])) + this[_0xdd42[3]]) } } };
Starfield[_0xdd42[8]][_0xdd42[14]] = function() { var _0x2107xa = this[_0xdd42[1]][_0xdd42[25]](_0xdd42[24]);
    _0x2107xa[_0xdd42[26]] = _0xdd42[27];
    _0x2107xa[_0xdd42[28]](0, 0, this[_0xdd42[2]], this[_0xdd42[11]]);
    _0x2107xa[_0xdd42[26]] = _0xdd42[29]; for (var _0x2107x7 = 0; _0x2107x7 < this[_0xdd42[5]][_0xdd42[21]]; _0x2107x7++) { var _0x2107x9 = this[_0xdd42[5]][_0x2107x7];
        _0x2107xa[_0xdd42[28]](_0x2107x9[_0xdd42[30]], _0x2107x9[_0xdd42[22]], _0x2107x9[_0xdd42[31]], _0x2107x9[_0xdd42[31]]) } };

function Star(_0x2107xc, _0x2107xd, _0x2107xe, _0x2107xf) { this[_0xdd42[30]] = _0x2107xc;
    this[_0xdd42[22]] = _0x2107xd;
    this[_0xdd42[31]] = _0x2107xe;
    this[_0xdd42[23]] = _0x2107xf }