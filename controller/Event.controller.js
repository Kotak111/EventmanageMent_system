const Event = require("../models/Event.model");
const cloudinary = require("../utils/cloudinary")
const fs = require("fs")
//create Event
exports.EventCreate = async (req, res) => {
  try {
    const { name, date, location, description, maxAttendance, type } = req.body;

    if (!name || !date || !location || !description || !maxAttendance) {
      return res.status(400).json({
        success: false,
        message: "All fields  are required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required"
      });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'Event',
      timeout: 60000
    });
    const EventAdd = new Event({
      name,
      date,
      location,
      description,
      maxAttendance,
      type,
      image: result.secure_url,
      cloudinary_id: result.public_id,
      createdBy: req.user._id
    });

    await EventAdd.save();
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("Error deleting file:", err);
      } else {
        console.log("File deleted from server.");
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Event successfully added',
    });

  } catch (error) {
    console.error('Error:', error.response || error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

//Get All Event
exports.GetAllEvent = async (req, res) => {
  try {
    const EventFind = await Event.find().populate('createdBy', 'username email')
      .exec();
    if (EventFind.length > 0) {
      res.json({
        success: true,
        EventFind: EventFind
      });
    } else {
      return res.json({
        success: false,
        message: "No Event found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Get By Id Event
exports.GetByIdEvent = async (req, res) => {
  try {
    const EventGet = await Event.findById(req.params.id).populate('createdBy', 'username email')
    if (EventGet) {
      res.json({
        success: true,
        EventGet: EventGet
      })
    }
  } catch (error) {
    console.log(error);

  }
}

//delete Event
exports.DeleteEvent = async (req, res) => {
  try {
    let find = await Event.findById(req.params.id);
    if (!find) {
      res.json({
        success: true,
        message: "Event  not found"
      })
    }
    await cloudinary.uploader.destroy(find.cloudinary_id);
    console.log(find.cloudinary_id);

    await find.deleteOne();
    res.json({
      success: true,
      message: "Event is deleted"
    })
  } catch (error) {
    console.log(error);

  }
}


//update A Event

exports.UpdateEvent = async (req, res) => {
  let event = await Event.findById(req.params.id);

  // Check if the Event is found
  if (!event) {
    return res
      .status(404)
      .json({ success: false, message: "Event not found" });
  }
  await cloudinary.uploader.destroy(event.cloudinary_id);
  // Upload image to cloudinary
  let result;
  if (req.file) {
    result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'Event',
      timeout: 60000
    });
  }
  const data = {
    name: req.body.name,
    date: req.body.date,
    location: req.body.location,
    description: req.body.description,
    maxAttendance: req.body.maxAttendance,
    type: req.body.type,
    cookTime: req.body.cookTime,
    image: result?.secure_url,
    cloudinary_id: result?.public_id,
  };
  event = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
  res.status(200).json({
    success: true,
    message: "Event Is  Updated"
  });
}

// Get events with filters
exports.getByFilter = async (req, res) => {
  try {
    const { type, date, location, sortBy } = req.query;


    const filter = {};


    if (type) {
      filter.type = { $regex: new RegExp(type, 'i') };
    }
    if (location) {
      filter.location = { $regex: new RegExp(location, 'i') };
    }


    if (date) {
      const filterDate = new Date(date);
      if (!isNaN(filterDate.getTime())) {
        filter.date = { $gte: filterDate };
      } else {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    }


    let sort = {};
    if (sortBy) {
      const parts = sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; // desc -> -1, asc -> 1
    }


    const events = await Event.find(filter).sort(sort);
    res.status(200).json(events);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};
exports.rsvpToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;


    const event = await Event.findById(eventId);


    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }


    if (event.RSVPs.includes(userId)) {
      return res.status(400).json({ message: 'You have already RSVP’d to this event' });
    }


    if (event.RSVPs.length >= event.maxAttendance) {
      return res.status(400).json({ message: 'Event is full, no more RSVPs allowed' });
    }


    event.RSVPs.push(userId);


    await event.save();

    res.status(200).json({ message: 'RSVP successful' });

  } catch (error) {
    res.status(500).json({ message: 'Error while RSVPing to event', error });
  }
};


// Get RSVP'd events for the logged-in user
exports.getUserRSVPs = async (req, res) => {
  try {
    const userId = req.user._id;


    const events = await Event.find({ RSVPs: userId })
      .populate('createdBy', 'name')
      .select('name date location maxAttendance type');

    if (events.length === 0) {
      return res.status(404).json({ message: 'No RSVP events found for this user' });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching RSVP events', error });
  }
};






