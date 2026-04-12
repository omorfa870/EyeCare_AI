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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("../models/User"));
const Admin_1 = __importDefault(require("../models/Admin"));
const FIXED_ADMINS = [
    { email: 'admin0001@eye.com', password: '123456', firstName: 'Admin', lastName: 'One' },
    { email: 'admin0002@eye.com', password: '123456', firstName: 'Admin', lastName: 'Two' },
    { email: 'admin0003@eye.com', password: '123456', firstName: 'Admin', lastName: 'Three' },
];
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    let created = 0;
    let skipped = 0;
    for (const admin of FIXED_ADMINS) {
        const exists = yield User_1.default.findOne({ email: admin.email });
        if (exists) {
            console.log(`  [skip]    ${admin.email} — already exists`);
            skipped++;
            continue;
        }
        const user = yield User_1.default.create({
            email: admin.email,
            password: admin.password,
            role: 'admin',
            profile: { firstName: admin.firstName, lastName: admin.lastName },
        });
        yield Admin_1.default.create({
            user: user._id,
            roleTitle: 'Super Admin',
            permissions: {
                manageUsers: true,
                manageDoctors: true,
                manageHospitals: true,
                viewAnalytics: true,
            },
        });
        console.log(`  [created] ${admin.email}`);
        created++;
    }
    console.log(`\nDone — ${created} created, ${skipped} skipped.`);
    process.exit(0);
});
run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
