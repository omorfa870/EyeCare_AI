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
exports.toggleBlockedDate = exports.getBlockedDates = void 0;
const BlockedDate_1 = __importDefault(require("../models/BlockedDate"));
// @desc    Get blocked dates for a doctor
// @route   GET /api/doctors/:id/blocked-dates
const getBlockedDates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const blocked = yield BlockedDate_1.default.find({ doctor: id });
        res.json(blocked.map(b => b.date));
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getBlockedDates = getBlockedDates;
// @desc    Toggle a blocked date (block if not blocked, unblock if already blocked)
// @route   POST /api/availability/blocked-dates
const toggleBlockedDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.body; // YYYY-MM-DD string
        const doctorId = req.user._id;
        if (!date)
            return res.status(400).json({ message: 'Date is required' });
        const existing = yield BlockedDate_1.default.findOne({ doctor: doctorId, date });
        if (existing) {
            yield existing.deleteOne();
            return res.json({ blocked: false, date });
        }
        yield BlockedDate_1.default.create({ doctor: doctorId, date });
        res.status(201).json({ blocked: true, date });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.toggleBlockedDate = toggleBlockedDate;
