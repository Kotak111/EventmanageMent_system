const EventController=require("../controller/Event.controller");
const { auth, IsUser } = require("../utils/auth");
const upload=require("../utils/image.add")
const router=require("express").Router();
router.post("/eventadd",auth,IsUser,upload.single("image"),EventController.EventCreate);
router.get("/eventview",auth,IsUser,EventController.GetAllEvent)
router.get("/:id",auth,IsUser,EventController.GetByIdEvent)
router.delete("/:id",auth,IsUser,EventController.DeleteEvent)
router.patch("/:id",auth,IsUser,upload.single("image"),EventController.UpdateEvent)
router.get("/",auth,IsUser,EventController.getByFilter)

//Rsvp control for Registration user
router.post('/events/:id/rsvp', auth,IsUser, EventController.rsvpToEvent);
router.get('/users/rsvps', auth,IsUser, EventController.getUserRSVPs);


module.exports=router;