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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var regionIndia, regionAmerica, regionGlobal, passwordHash, rest1, rest2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding database...');
                    return [4 /*yield*/, prisma.region.upsert({
                            where: { name: 'India' },
                            update: {},
                            create: { name: 'India' },
                        })];
                case 1:
                    regionIndia = _a.sent();
                    return [4 /*yield*/, prisma.region.upsert({
                            where: { name: 'America' },
                            update: {},
                            create: { name: 'America' },
                        })];
                case 2:
                    regionAmerica = _a.sent();
                    return [4 /*yield*/, prisma.region.upsert({
                            where: { name: 'Global' },
                            update: {},
                            create: { name: 'Global' },
                        })];
                case 3:
                    regionGlobal = _a.sent();
                    console.log('Regions seeded.');
                    return [4 /*yield*/, bcrypt.hash('password123', 10)];
                case 4:
                    passwordHash = _a.sent();
                    // 2. Create Users
                    // Admin
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'nick.fury@slooze.com' },
                            update: {},
                            create: {
                                email: 'nick.fury@slooze.com',
                                password: passwordHash,
                                name: 'Nick Fury',
                                role: 'ADMIN',
                                regionId: regionGlobal.id,
                            },
                        })];
                case 5:
                    // 2. Create Users
                    // Admin
                    _a.sent();
                    // Managers
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'captain.marvel@slooze.com' },
                            update: {},
                            create: {
                                email: 'captain.marvel@slooze.com',
                                password: passwordHash,
                                name: 'Captain Marvel',
                                role: 'MANAGER',
                                regionId: regionIndia.id,
                            },
                        })];
                case 6:
                    // Managers
                    _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'captain.america@slooze.com' },
                            update: {},
                            create: {
                                email: 'captain.america@slooze.com',
                                password: passwordHash,
                                name: 'Captain America',
                                role: 'MANAGER',
                                regionId: regionAmerica.id,
                            },
                        })];
                case 7:
                    _a.sent();
                    // Members
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'thanos@slooze.com' },
                            update: {},
                            create: {
                                email: 'thanos@slooze.com',
                                password: passwordHash,
                                name: 'Thanos',
                                role: 'MEMBER',
                                regionId: regionIndia.id,
                            },
                        })];
                case 8:
                    // Members
                    _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'thor@slooze.com' },
                            update: {},
                            create: {
                                email: 'thor@slooze.com',
                                password: passwordHash,
                                name: 'Thor',
                                role: 'MEMBER',
                                regionId: regionIndia.id,
                            },
                        })];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'travis@slooze.com' },
                            update: {},
                            create: {
                                email: 'travis@slooze.com',
                                password: passwordHash,
                                name: 'Travis',
                                role: 'MEMBER',
                                regionId: regionAmerica.id,
                            },
                        })];
                case 10:
                    _a.sent();
                    console.log('Users seeded.');
                    return [4 /*yield*/, prisma.restaurant.upsert({
                            where: { id: 'rest-india-1' },
                            update: {},
                            create: {
                                id: 'rest-india-1',
                                name: 'Delhi Dhaba',
                                regionId: regionIndia.id,
                                menuItems: {
                                    create: [
                                        { name: 'Butter Chicken', price: 15.0 },
                                        { name: 'Naan', price: 2.0 },
                                    ],
                                },
                            },
                        })];
                case 11:
                    rest1 = _a.sent();
                    return [4 /*yield*/, prisma.restaurant.upsert({
                            where: { id: 'rest-america-1' },
                            update: {},
                            create: {
                                id: 'rest-america-1',
                                name: 'American Burgers',
                                regionId: regionAmerica.id,
                                menuItems: {
                                    create: [
                                        { name: 'Cheeseburger', price: 10.0 },
                                        { name: 'Fries', price: 4.0 },
                                    ],
                                },
                            },
                        })];
                case 12:
                    rest2 = _a.sent();
                    console.log('Restaurants seeded.');
                    console.log('Database seeding completed successfully.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
