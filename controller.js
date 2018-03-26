const 
  mongoose = require('mongoose'),
  ContactSchema = require('./model').ContactSchema,
  Contact = mongoose.model('Contact', ContactSchema);

// Add a new Contact function
module.exports.addNewContact = (req, res) => {
    let newContact = new Contact(req.body);

    newContact.save((err, contact) => {
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};

// Function to get all contacts
module.exports.getContacts = (req, res) => {
    Contact.find({}, (err, contact) => {
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};

// Get a contact by its object id
module.exports.getContactByObjectID = (req, res) => {
    Contact.findById(req.params.contactId, (err,contact) => {
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};

// Get by messengerID
module.exports.getContactByID = (req, res) => {
    Contact.findOne({_id: req.params.contactId}, (err,contact) => {
        console.log(res.send);
        console.log(res.json);
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};

// TODO
module.exports.getFieldByID = (req,res) => {
    Contact.findOne({_id: req.params.contactId}, (err,contact) => {
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};


// Update a contact and returns new infos
module.exports.updateContact = (req, res) => {
    Contact.findOneAndUpdate({_id: req.params.contactId}, req.body, { new: true}, (err,contact) => {
        if(err){
            res.send(err);
        }
        res.json(contact);
    });
};

module.exports.deleteContact = (req, res) => {
    Contact.remove({_id: req.params.contactId }, (err, contact) => {
        if(err){
            res.send(err);
        }
        res.json({message: 'Contact Deleted'});
    });
};