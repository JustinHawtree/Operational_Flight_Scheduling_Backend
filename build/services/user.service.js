"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupUser = exports.loginUser = exports.getPilots = exports.getNonApprovedUsers = exports.getAllUsers = void 0;
var database_pool_1 = require("./database.pool");
var bcrypt_1 = require("../util/bcrypt");
var jwt_1 = require("../util/jwt");
var baseUserData = "SELECT account_uuid, first_name, last_name, rank_uuid, pilot_status, role, user_status FROM account";
var makeUserObject = function (account_uuid, email, first_name, last_name, accepted, rank_uuid, pilot_status, role, user_status) {
    return { account_uuid: account_uuid, email: email, first_name: first_name, last_name: last_name, accepted: accepted, rank_uuid: rank_uuid, pilot_status: pilot_status, role: role, user_status: user_status };
};
exports.getAllUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, userList, SQL, sqlResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = null;
                SQL = baseUserData + " WHERE role != 'Admin'";
                sqlResult = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, database_pool_1.pool.connect()];
            case 2:
                client = _a.sent();
                return [4 /*yield*/, client.query(SQL)];
            case 3:
                sqlResult = _a.sent();
                client.release();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                if (client)
                    client.release();
                throw new Error("Get All Users Error:" + error_1);
            case 5:
                userList = sqlResult.rows.map(function (user) {
                    return makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid, user.pilot_status, user.role, user.user_status);
                });
                return [2 /*return*/, userList];
        }
    });
}); };
exports.getNonApprovedUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, userList, SQL, sqlResult, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = null;
                SQL = baseUserData + " WHERE accepted = false";
                sqlResult = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, database_pool_1.pool.connect()];
            case 2:
                client = _a.sent();
                return [4 /*yield*/, client.query(SQL)];
            case 3:
                sqlResult = _a.sent();
                client.release();
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                if (client)
                    client.release();
                throw new Error("Get Non Approved Users Error:" + error_2);
            case 5:
                userList = sqlResult.rows.map(function (user) {
                    return makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid, user.pilot_status, user.role, user.user_status);
                });
                return [2 /*return*/, userList];
        }
    });
}); };
exports.getPilots = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, userList, SQL, sqlResult, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = null;
                SQL = baseUserData + " WHERE pilot_status <> 'N/A'";
                sqlResult = null;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, database_pool_1.pool.connect()];
            case 2:
                client = _a.sent();
                return [4 /*yield*/, client.query(SQL)];
            case 3:
                sqlResult = _a.sent();
                client.release();
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                if (client)
                    client.release();
                throw new Error("Get Pilots Users Error:" + error_3);
            case 5:
                userList = sqlResult.rows.map(function (user) {
                    return makeUserObject(user.account_uuid, user.email, user.first_name, user.last_name, user.accepted, user.rank_uuid, user.pilot_status, user.role, user.user_status);
                });
                return [2 /*return*/, userList];
        }
    });
}); };
exports.loginUser = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var client, user, SQL, sqlResult, error_4, passwordCheck, tokenResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = null;
                SQL = "SELECT password, accepted, role, account_uuid FROM account WHERE email = $1";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, database_pool_1.pool.connect()];
            case 2:
                client = _a.sent();
                return [4 /*yield*/, client.query(SQL, [email])];
            case 3:
                sqlResult = _a.sent();
                client.release();
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                if (client)
                    client.release();
                throw new Error("Login Error from SQL Query error:" + error_4);
            case 5:
                if (sqlResult.rows.length === 0) {
                    throw new Error("No User Found with email: " + email);
                }
                return [4 /*yield*/, bcrypt_1.compareHash(password, sqlResult.rows[0].password)];
            case 6:
                passwordCheck = _a.sent();
                // Check to see if its the correct password for the desired account
                if (!passwordCheck) {
                    throw new Error("Login User Error: Bad Password attempt for: " + email);
                }
                // Check to see if the user has been approved
                if (!sqlResult.rows[0].accepted) {
                    throw new Error("Login User Error: User not approved: " + email);
                }
                return [4 /*yield*/, jwt_1.setToken({ email: email, role: sqlResult.rows[0].role }).catch(function (error) {
                        throw new Error("JWT ERROR: loginUser setToken() error" + error);
                    })];
            case 7:
                tokenResult = _a.sent();
                return [2 /*return*/, {
                        account_uuid: sqlResult.rows[0].account_uuid,
                        access_token: tokenResult.token,
                        access_token_created: tokenResult.tokenDate,
                        access_token_expires_in: tokenResult.expires_in,
                        role: sqlResult.rows[0].role,
                        email: email
                    }];
        }
    });
}); };
exports.signupUser = function (email, password, first_name, last_name) { return __awaiter(void 0, void 0, void 0, function () {
    var client, sqlResult, hashPassword, SQL, values, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = null;
                sqlResult = null;
                return [4 /*yield*/, bcrypt_1.getHash(password).catch(function (error) {
                        throw new Error("Bcrypt Error: signupUser bcrypt error:" + error);
                    })];
            case 1:
                hashPassword = _a.sent();
                SQL = "INSERT INTO account(email, password, first_name, last_name, accepted) VALUES($1, $2, $3, $4, $5)";
                values = [email, hashPassword, first_name, last_name];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                return [4 /*yield*/, database_pool_1.pool.connect()];
            case 3:
                client = _a.sent();
                return [4 /*yield*/, client.query(SQL, values)];
            case 4:
                sqlResult = _a.sent();
                client.release();
                return [3 /*break*/, 6];
            case 5:
                error_5 = _a.sent();
                if (client)
                    client.release();
                if (error_5.code === '23505') {
                    if (error_5.constraint === 'account_email_key') {
                        return [2 /*return*/, { error: "Email is already in use." }];
                    }
                }
                throw new Error("Signup Error from SQL Query error:" + error_5);
            case 6: return [2 /*return*/, {}];
        }
    });
}); };
