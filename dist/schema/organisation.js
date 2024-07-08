const yup = require('yup');
const {
  v4: uuidv4
} = require('uuid');
const organisationSchema = yup.object().shape({
  orgId: yup.string().uuid().required().default(() => uuidv4()),
  name: yup.string().required(),
  description: yup.string()
});
module.exports = organisationSchema;