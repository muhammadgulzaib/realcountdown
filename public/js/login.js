
const form = document.querySelector("#form")

async function loginUser(e){
    e.preventDefault()
    const user = {
      email: document.querySelector("#email").value,
      password: document.querySelector("#password").value
    }
    console.log(user)
    const data = await fetch(`${requestUrl}/agent`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(user)
    })
    console.log(data)
    const userData = await data.json()
    if(data.status === 200) {
      localStorage.setItem("user", JSON.stringify(userData))
      window.location = `${requestUrl}/agent/main`;
    }
    else if(data.status === 401){
      document.querySelector("#error-message").textContent = userData.message
    }
}
form.addEventListener("submit", loginUser)