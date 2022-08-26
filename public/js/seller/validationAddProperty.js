$().ready(function () {
  $("#addProperty").validate({
    rules: {
      propertyName: "required",
      propertyAddress: "required",
      mailingAddress: "required",
      email: {
        required: true,
        email: true,
      },
      phone: {
        required: true,
        minlength: 8,
        maxlength: 15,
      },
      zipCode: {
        required: true,
        minlength: 3,
        maxlength: 32,
      },
    },
    messages: {
      propertyName: "Property Name is required",
      propertyAddress: "Property Address is required",
      mailingAddress: "Mailing Address is required",
      email: {
        required: "Email is required",
        email: "Email is not valid",
      },
      phone: {
        required: "Phone is required",
        minlength: "Length should be greater than 8",
        maxlength: "Length should be greater than 15",
      },
      zipCode: {
        required: "Zip Code is required",
        minlength: "Length should be greater than 8",
        maxlength: "Length should be greater than 32",
      },
    },
  });
});
