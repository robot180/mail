document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  //original - document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email(reply) {
//see project notes
  if (typeof reply !== 'undefined') {
      console.log("This is a reply email");
    } else {
      console.log("Composing a new email")};

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read_email').style.display = 'none';


  // Clear out composition fields (original)
  // document.querySelector('#compose-recipients').value = '';
  // document.querySelector('#compose-subject').value = '';
  // document.querySelector('#compose-body').value = '';

  // Clear out composition fields

  if (typeof reply !== 'undefined') {
    document.querySelector('#compose-recipients').value = reply.sender;
    if (reply.subject.startsWith('Re:')) {
        document.querySelector('#compose-subject').value = reply.subject;
      } else {
        //test if multiple Re is added
        document.querySelector('#compose-subject').value =`Re: ${reply.subject}`;
      };
    const date = new Date(reply.timestamp);
    const offset = date.getTimezoneOffset();
    let timestamp = new Date(date.getTime() - offset * 60000)
    timestamp = timestamp.toLocaleString();
    document.querySelector('#compose-body').value = `\n\nOn ${timestamp} ${reply.sender} wrote:\n${reply.body}`;
  } else {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  };


  //TODO
 //Listen for form submission (ie sending email)
 document.querySelector('#compose-form').onsubmit = function() {

  //get the value of the 3 items making up the email: recepients, subject, body
  const recipients =  document.querySelector('#compose-recipients').value;
  const subject =  document.querySelector('#compose-subject').value;
  const body =  document.querySelector('#compose-body').value;
  console.log(body);

  fetch('/emails', {   
    method: 'POST',    
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      
  });
  load_mailbox('sent')
  return false;
  };

};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read_email').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // console.log(`${mailbox}`);
  //inbox, sent, archive have to retrieve all the emails in that mail box using the mailbox.view
  //fetch code was provided in the project specification:
  // fetch("/emails/`${mailbox}")
  fetch(`/emails/${mailbox}`)
  //fetch the JsonResponse from Django then make the data in the response accessible via response.json()
  //the returned JSON data is a promise object which we can call emails
  .then(response => {
    //console.log(response);
    return response.json();
  })
  .then(emails => {
      // Print emails to see how the JsonReponse data looks in JS
      //console.log(emails);
      //loop through an array of JSON objects https://www.sitepoint.com/loop-through-json-response-javascript/
      // loop thru an array in JS https://www.w3schools.com/js/js_arrays.asp
      // let text = "<ul>";
      // for (let i = 0; i < emails.length; i++) {
      //   text += "<li>" + emails[i] + "</li>";
      // }
      // text += "</ul>";
      // console.log(text);
    //code is based on the posts app in lecture
      //emails.forEach(console.log);
      // emails.forEach((emails) => {
      //   console.log(`${emails.body}`);
      //   console.log(`${emails.subject}`);
      // });
      //emails is a an array of JSON objects. The JSON keys are the same as the keys from the serialized Email Model. See Project notes for more info
      //forEach loops through the entire array. so the following code means for each element in the email array call add_email(element)
      emails.forEach(populate_mailbox);
    //   // ... do something else with emails ...

  })


  
  //the following populate_mailbox fuction is called for each item in the emails array, it:
  // populates the inbox, sent, or archive with emails fetched
  // the sender, subject and timestamp of the email is stored in a div with class email_div
  // this is similar to the task.html in lecture5 and post app in lecture6
  function populate_mailbox(contents) {
    // Create a new div with class email_div. This is box containing info: sender, subject, and time sent
    const email = document.createElement('div');
    email.className = 'email_div';
    if (contents.read == true) {
      email.style.backgroundColor = '#E5E5E5';
    };
    if (contents.read == false) {
      email.classList.add('font-weight-bold');
    };
    // console.log(email.classList);
    const date = new Date(contents.timestamp);
    const offset = date.getTimezoneOffset();
    let timestamp = new Date(date.getTime() - offset * 60000)
    timestamp = timestamp.toLocaleString();
    email.innerHTML = `Sender:${contents.sender} Subject: ${contents.subject} Time Sent: ${timestamp}`;
    //email.id = `email-${contents.id}`; only stores the email object id. not used since email.data = contents can store the entire email objecct
    email.data = contents;
    if (contents.read == true && contents.archived == false && mailbox == 'inbox') {
      const unread_button = document.createElement('button');
      unread_button.innerHTML = "Mark Unread";
      unread_button.className= "unread";
      unread_button.data = contents;
      email.append(unread_button);
    };
    //console.log(email);
    //append this div to the already given emails-view div
    document.querySelector('#emails-view').append(email);
    // clicking an email div will access that email
    //using queryselectorall and forEach didnt' work alerting before clicking - delegation issue? https://stackoverflow.com/questions/34896106/attach-event-to-dynamic-elements-in-javascript
    // document.querySelectorAll('.email_div').forEach.onclick = function() {
    //   alert('Hello!');
    // }
    //use target (see below) to make this work
  };

};

// the following addEventListener will make a fetch depending on what type of element is clicked
//The elements can be an email from inbox, the reply, read, or archive buttons that appear while reading the email
//followed lecture6 how to hide the post div 43:00. Per Hint, we could have add an eventhandler to each email_div when running populate_mailbox?
// this also talks about .target: https://stackoverflow.com/questions/34896106/attach-event-to-dynamic-elements-in-javascript
document.addEventListener('click', event => {
  const element_clicked = event.target
  classes = Array.from(element_clicked.classList)
  //if the email_div (email box) is clicked, access the entire email and mark it as read
  if (classes.includes('email_div')) {
    email = element_clicked.data;
    console.log(email);
    //const email_num = Number(element_clicked.id.slice(-1)); not used since populate_mailbox function doesn't use email.id = `email-${contents.id}`
    if (email.read == false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });
    };
    //Following fetch is unnecessary. The email instance was element_clicked.data. This fetch is getting what I already have
    // fetch(`/emails/${email.id}`)
    // .then(response => response.json())
    // .then(email => {
    //     // Print email
    //     console.log(email);
    read_email(email);
   

  } else if (element_clicked.id == 'reply') {
    // console.log(element_clicked.data);
    //if the reply button call the compose_email and pass in the email as a parameter
    compose_email(element_clicked.data);
  
  // } else if (element_clicked.id === 'read') {
  //     readbutton = element_clicked;
  //     console.log("Read/Unread button clicked");
  //     email = element_clicked.data;
  //     console.log(email.id);
  //     if (email.read == false) {
  //       fetch(`/emails/${email.id}`, {
  //         method: 'PUT',
  //         body: JSON.stringify({
  //             read: true
  //         })
  //       });
  //       console.log(email.read);
  //       console.log(email);
  //       readbutton.innerHTML = 'Mark as Unread';
  //     } else {
  //       fetch(`/emails/${email.id}`, {
  //         method: 'PUT',
  //         body: JSON.stringify({
  //             read: false
  //         })
  //       });
  //       console.log(email.read);
  //       console.log(email);
  //       readbutton.innerHTML = 'Mark as Read';
  //     }
    //element_clicked.data accesses the JSON email object stored in the HTML element and .read accesses the value of the "read" key of that email
    // the following fetch was provide in the project specification

  //if the Mark Unread button from Inbox is clicked, update the email.read = false and refresh the html
  } else if (element_clicked.className === 'unread') {
    email = element_clicked.data;
    console.log(email);
    //the "Mark Unread" button should disappear upon clicking
    element_clicked.remove();
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: false
      })
    });
    setTimeout(() => load_mailbox('inbox'), 100);
    // return load_mailbox('inbox');   WIthout setTimeout, the load_mailbox loads the page before the SQL db is updated.
    // So even if email.read is set to false, load_mailbox will still see it as true and load the html


  } else if (element_clicked.id === 'archive') {
    email = element_clicked.data;
    archiveEmail(email);
    // fetch(`/emails/${email.id}`, {   
    //   method: 'PUT',    
    //   body: JSON.stringify({
    //     //! is bang which does the opposite of 
    //       archived: !email.archived
    //   })
    // });
    // setTimeout(function(){ load_mailbox('inbox'); }, 100)
  }
  
});
  
//read_email is called when the beny clicks any email in the inbox. 
//It will load the selected email and provide the option to reply and mark email as read/undread and archive/unarchive
function read_email(selected_email) {
document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#read_email').style.display = 'block';
console.log(selected_email.id);
console.log(selected_email);
console.log(`We are reading this: ${selected_email.id}`);
const datetime = new Date(selected_email.timestamp);
const offset1 = datetime.getTimezoneOffset();
let timestamp = new Date(datetime.getTime() - offset1 * 60000)
timestamp = timestamp.toLocaleString();
document.querySelector('#read_email').innerHTML = `From:${selected_email.sender} Subject: ${selected_email.subject} Received On: ${timestamp}<br><br>`;
const body = document.createElement('p');
// body.innerHTML = `Body: ${selected_email.body}`;
console.log(selected_email.timestamp);
console.log("The data type is", typeof selected_email.timestamp);
const date = new Date(selected_email.timestamp);
const offset = date.getTimezoneOffset();
console.log(offset);
console.log(date);
console.log("The data type is", typeof date);
let time = new Date(date.getTime() - offset * 60000)
//https://www.tutorialspoint.com/how-to-convert-utc-date-time-into-local-date-time-using-javascript#:~:text=We%20must%20use%20the%20getTimezoneOffset,to%20the%20local%20date%20time.
time = time.toLocaleString();
body.innerHTML = `<br>On ${time} ${selected_email.sender} wrote:<br>${selected_email.body}`;
document.querySelector('#read_email').append(body);
//can I bold From, Subject, Time Sent and Body?

//create reply button
const replybutton = document.createElement('button');
replybutton.className ="btn btn-primary mx-2";
replybutton.setAttribute('id','reply');
//replybutton.value = selected_email; doens't work because HTML value can only store string values, use data instead
replybutton.data = selected_email;
console.log(replybutton.data);
replybutton.innerHTML = 'Reply';
document.querySelector('#read_email').append(replybutton);

//create read button
// const readbutton = document.createElement('button');
// readbutton.className ="btn btn-primary mx-2";
// readbutton.setAttribute('id','read');
// readbutton.data = selected_email;
// console.log(readbutton.data);
// if (selected_email.read == false ) {
//   readbutton.innerHTML = 'Mark as Read'
// } else {
//   readbutton.innerHTML = 'Mark as Unread'
// };
// document.querySelector('#read_email').append(readbutton);

//create archive button
const archivebutton = document.createElement('button');
archivebutton.className ="btn btn-primary mx-2";
archivebutton.setAttribute('id','archive');
archivebutton.data = selected_email;
console.log(archivebutton.data);
if (selected_email.archived == false ) {
  archivebutton.innerHTML = 'Archive'
} else {
  archivebutton.innerHTML = 'Unarchive'
};
document.querySelector('#read_email').append(archivebutton);

//TODO: need to make accessing the read_email updates the Email model to read = True. Use PUT per specification
};


async function archiveEmail(email) {
  // Waits for status of "archived" of email to be updated
  await fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived
    })
  })
  // Returns inbox
  return load_mailbox('inbox');
}