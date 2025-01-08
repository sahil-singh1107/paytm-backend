export const userSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["firstName", "lastName", "password", "email"],
            properties: {
                firstName : {bsonType : "string", minLength : 3, maxLength : 50},
                lastName: { bsonType: "string", minLength : 3, maxLength : 50},
                password : {bsonType : "string", minLength : 8},
                email: { bsonType: "string"},
            },
        },
    },
};