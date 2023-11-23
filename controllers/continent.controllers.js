const Joi = require("joi");
const Continent = require("../models/continent");

const getContinent = async (req,res) => {
    try {
        const data = await Continent.find();

        return res.status(200).send({status: 'success',data: data, message: 'Continent fetch successfully' })

    }catch(e){
        return res.status(500).send({status: 'error', message: e.message})
    }
}

const createContinent = async (req,res) => {
    try{
        const schema = Joi.object({
            name: Joi.string(),
            currencyCode: Joi.string().required(),
            currencyRate: Joi.string().required()
          });

          const result = schema.validate(req.body);
          if (result.error)
            return res
              .status(400)
              .send({ status: "error", message: result.error.details[0].message });
          
              const continent = Continent({ name: req.body.name, countryCode: req.body.currencyCode, currencyRate: req.body.currencyRate});
              await continent.save();   
              return res.status(201).send({status: 'success',data: continent, message: 'Continent created successfully' })   

    }catch(e){
        console.log(e);
        return res.status(500).send({ status: "error", message: e.message });
    }
}

const updateContinent = async (req,res) => {
    try{
        const update = await Continent.findByIdAndUpdate(
            req.body.id,
            { name: req.body.name, countryCode: req.body.currencyCode, currencyRate: req.body.currencyRate },
            { new: true }
          );
        return res.status(200).send({status: 'success',data: update, message: 'Continent update successfully' })
    }catch(e){
        console.log(e);
        return res.status(500).send({ status: "error", message: e.message });
    }
}

const findByIdContinent = async (req,res) => {
    try {
        const data = await Continent.findById({_id: req.body.id});

        return res.status(200).send({status: 'success',data: data, message: 'Continent fetch successfully' })

    }catch(e){
        return res.status(500).send({status: 'error', message: e.message})
    }
}

const deleteContinent = async (req,res) => {
    try {
        const data = await Continent.deleteOne({_id: req.body.id})
        if(data.acknowledged){
            return res.status(200).send({status: 'success',data: data, message: 'Continent delete successfully' })
        }
        return res.status(404).send({status: 'error', message: 'not found'})
    }catch(e){
        return res.status(500).send({status: 'error', message: e.message})
    }
}

module.exports = {
    getContinent,
    createContinent,
    updateContinent,
    findByIdContinent,
    deleteContinent
  };