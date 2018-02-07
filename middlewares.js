const string_to_json = (req, res, next) => {
    console.log('String to JSON');
    console.log('string : ' + req.body.query + " type " + typeof req.body.query);
}

const test = (req,res,next) => {
    console.log('test');
    next();
}

module.exports = {
    string_to_json : string_to_json,
    test : test
};
