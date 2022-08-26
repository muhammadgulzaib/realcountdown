const EmailTemplate = (
  subject,
  tableHeader,
  username,
  email,
  contact,
  country,
  state,
  commision,
  Address,
  href
) => {
  return `  <main style="font-family: Arial, Helvetica, sans-serif">
    <div class="container" style="width: 100%; height: 100%">
      <h3>${subject}</h3>
      <table style="width: 100%">
        <tr style="background-color: rgb(149, 180, 238); color: white">
          <th colspan="2">${tableHeader}</th>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Username</td>
          <td style="padding: 0.3rem">${username}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Email</td>
          <td style="padding: 0.3rem">${email}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Contact</td>
          <td style="padding: 0.3rem">${contact}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Country</td>
          <td style="padding: 0.3rem">${country}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">State</td>
          <td style="padding: 0.3rem">${state}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Commision</td>
          <td style="padding: 0.3rem">${commision}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Address</td>
          <td style="padding: 0.3rem">${Address}</td>
        </tr>
      </table>
      <div class="button__section" style="margin-top: 0.5rem">
        <a
          href="${href}"
          class="btn"
          style="
            padding: 0.25rem 0.75rem;
            border: none;
            outline: none;
            background-color: rgb(57, 118, 231);
            border-radius: 5px;
            min-width: 10ch;
            height: 40px;
            font-size: 1rem;
            color: white;
            text-decoration: none;
          "
        >
          Go To Dashboard
        </a>
      </div>
    </div>
  </main>`;
};

const EmailTemplateSeller = (
  subject,
  tableHeader,
  username,
  email,
  contact,
  country,
  state,
  commision,
  Address,
  href
) => {
  return `  <main style="font-family: Arial, Helvetica, sans-serif">
    <div class="container" style="width: 100%; height: 100%">
      <h3>${subject}</h3>
      <table style="width: 100%">
        <tr style="background-color: rgb(149, 180, 238); color: white">
          <th colspan="2">${tableHeader}</th>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Username</td>
          <td style="padding: 0.3rem">${username}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Email</td>
          <td style="padding: 0.3rem">${email}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Contact</td>
          <td style="padding: 0.3rem">${contact}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Country</td>
          <td style="padding: 0.3rem">${country}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">State</td>
          <td style="padding: 0.3rem">${state}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Zip Code</td>
          <td style="padding: 0.3rem">${commision}</td>
        </tr>
        <tr style="background-color: rgb(182, 181, 181)">
          <td style="padding: 0.3rem">Address</td>
          <td style="padding: 0.3rem">${Address}</td>
        </tr>
      </table>
      <div class="button__section" style="margin-top: 0.5rem">
        <a
          href="${href}"
          class="btn"
          style="
            padding: 0.25rem 0.75rem;
            border: none;
            outline: none;
            background-color: rgb(57, 118, 231);
            border-radius: 5px;
            min-width: 10ch;
            height: 40px;
            font-size: 1rem;
            color: white;
            text-decoration: none;
          "
        >
          Go To Dashboard
        </a>
      </div>
    </div>
  </main>`;
};

module.exports = { EmailTemplate, EmailTemplateSeller };
