import express from "express";
import { Booking } from "../models/booking.model.js";
import { auth } from "../middlewares/auth.js";
import { User } from "../models/user.models.js";
import { sendEmail } from "../config/mailer.js";
import { Vehicle } from "../models/vehicle.models.js";

const router = express.Router();

router.post("/bookings", auth, async (req, res) => {
  const {
    vehicleId,
    ownerId,
    driverId,
    bookingStart,
    bookingEnd,
    totalAmount,
  } = req.body;
  const owner = await User.findById(ownerId);
  const vehicle = await Vehicle.findById(vehicleId);

  // console.log(req.body);
  // console.log("USER ID-", req.user.id);
  // console.log("NewBooking- ", {
  //     vehicleId,
  //     driverId,
  //     ownerId,
  //     userId: req.user.id,
  //     bookingStart,
  //     bookingEnd,
  //     status: 'pending',
  //     totalAmount
  // });
  try {
    const newBooking = await Booking.create({
      vehicleId,
      driverId,
      ownerId,
      userId: req.user.id,
      bookingStart,
      bookingEnd,
      status: "pending",
      totalAmount,
    });
    // console.log(newBooking);

    await newBooking.save();
    const bookingID = newBooking._id;
    const user = await User.findOne({ _id: req.user.id });
    user.bookings.push(newBooking._id);
    await user.save();

    const ownerEmail = owner.email;
    if (!ownerEmail) {
      return res.status(500).send("Owner email not found");
    }

    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedBookingStart = newBooking.bookingStart
      .toLocaleDateString("en-GB", options)
      .replace(/\//g, "-");
    const formattedBookingEnd = newBooking.bookingEnd
      .toLocaleDateString("en-GB", options)
      .replace(/\//g, "-");

    const ownerNotify = await sendEmail(
      ownerEmail,
      `Booking Request: ${vehicle.brand} ${vehicle.model}. Booking ID: ${bookingID}`,
      `Dear ${owner.name}, \n${user.name} has requested to book your vehicle ${vehicle.brand} ${vehicle.model} from ${formattedBookingStart} to ${formattedBookingEnd}.\n\nRegards, \nTeam WheelZOnRent`
    );

    const userNotify = await sendEmail(
      user.email,
      `Booking Request sent. Vehicle: ${vehicle.brand} ${vehicle.model}. Booking ID: ${bookingID}`,
      `Dear ${user.name}, \nYour booking request for ${vehicle.brand} ${vehicle.model} from ${formattedBookingStart} to ${formattedBookingEnd} has been sent to the owner. \n\nRegards, \nTeam WheelZOnRent`
    );

    res.json({ success: true, bookingId: newBooking._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

router.get("/bookings/pending", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      ownerId: req.user.id,
      status: { $in: ["pending", "approved"] },
    }).populate("vehicleId userId");
    console.log("bookings: ", bookings);
    res.json(bookings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/bookings/:id/approve", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate("ownerId");
    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    booking.status = "approved";
    await booking.save();

    const owner = booking.ownerId;
    const vehicle = await Vehicle.findById(booking.vehicleId);
    const user = await User.findById(booking.userId);

    const userEmail = user.email;
    if (!userEmail) {
      return res.status(500).send("Owner email not found");
    }

    const ownerEmail = owner.email;
    if (!ownerEmail) {
      return res.status(500).send("Owner email not found");
    }

    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedBookingStart = booking.bookingStart
      .toLocaleDateString("en-GB", options)
      .replace(/\//g, "-");
    const formattedBookingEnd = booking.bookingEnd
      .toLocaleDateString("en-GB", options)
      .replace(/\//g, "-");

    const userNotify = await sendEmail(
      userEmail,
      `Booking approved. Vehicle: ${vehicle.brand} ${vehicle.model}. Booking ID: ${bookingId}`,
      `Dear ${user.name}, \nYour booking request for ${vehicle.brand} ${vehicle.model} from ${formattedBookingStart} to ${formattedBookingEnd} has been approved by the owner. \n\nRegards, \nTeam WheelZOnRent`
    );

    const ownerNotify = await sendEmail(
      ownerEmail,
      `Booking approved. Vehicle: ${vehicle.brand} ${vehicle.model}. Booking ID: ${bookingId}`,
      `Dear ${owner.name}, \nYour approval for the booking request of ${vehicle.brand} ${vehicle.model} from ${formattedBookingStart} to ${formattedBookingEnd} has been notified to the customer. \n\nRegards, \nTeam WheelZOnRent`
    );

    res.status(200).send("Booking approved");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/user/bookings", auth, async (req, res) => {
  try {
    const userBooking = await Booking.find({ userId: req.user.id }).populate(
      "vehicleId ownerId"
    );
    res.json(userBooking);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/booking/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
    }).populate("userId ownerId vehicleId");

    console.log("booking to Delete:", booking);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }


    try {
      await sendEmail(
        booking.userId.email,
        `Booking Cancelled. Booking ID: ${booking._id}`,
        `Dear ${booking.userId.name}, \nYour booking for ${booking.vehicleId.brand} ${booking.vehicleId.model} has been cancelled. \n\nRegards, \nTeam WheelZOnRent`
      );
    } catch (emailError) {
      console.error("Error sending email to user:", emailError);
    }

    try {
      await sendEmail(
        booking.ownerId.email,
        `Booking Cancelled. Booking ID: ${booking._id}`,
        `Dear ${booking.ownerId.name}, \n${booking.userId.name} has cancelled the booking for your vehicle ${booking.vehicleId.brand} ${booking.vehicleId.model}. \n\nRegards, \nTeam WheelZOnRent`
      );
    } catch (emailError) {
      console.error("Error sending email to owner:", emailError);
    }

    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/bookings/unavailable-dates/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const bookings = await Booking.find({
      vehicleId: vehicleId,
      status: "approved",
    });
    const unavailableDates = bookings.map((booking) => {
      return {
        start: booking.bookingStart,
        end: booking.bookingEnd,
      };
    }); //array of objects dates
    return res.json({ unavailableDates });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unavailable dates" });
  }
});

export default router;
