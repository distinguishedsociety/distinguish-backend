const axios = require("axios");

const authenticateUser = async (email, password) => {
    let token;
    let error;

    var config = {
        method: "post",
        url: "https://apiv2.shiprocket.in/v1/external/auth/login",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            email: email,
            password: password,
        }),
    };

    axios({
        method: "post",
        url: "https://apiv2.shiprocket.in/v1/external/auth/login",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            email: email,
            password: password,
        }),
    })
        .then(function (response) {
            console.log(JSON.stringify(response.data.token));
            token = response.data.token;
            console.log(token);
            return token;
        })
        .catch(function (error) {
            console.log(error);
            throw new Error("Shiprocket authentication failed.");
        });
};

const checkPincodeAvailability = async (token, pincode) => {
    try {
        let token;
        let error;

        var config = {
            method: "get",
            url: "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer {${token}}`,
            },
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                return { data: response.data, error };
            })
            .catch(function (error) {
                console.log(error);
                return { data, error: error.message };
            });
    } catch (e) {
        console.log(e.message);
        return { data, error: error.message };
    }
};

module.exports = {
    authenticateUser,
};
