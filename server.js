function uploadToS3(conversation, payload,data) {
  //var s3_url_1 = `https://s3-application.practice-domain.tech/s3_upload`;
  var s3_url_2 = `http://localhost:3000/dev/submit`;
  var s3_options = {
    json: {
      conversation: conversation,
      payload: payload,
      data:data
    },
  };
  try {
     $request
    .post(s3_url_1, s3_options)
    .then(function (data) {
      console.log("S3 Response:", data.response);
    })
  } catch (error) {
    try {
      $request.post(s3_url_2, s3_options).then(function (data) {
        console.log("S3 Response:", data.response);
      });
    } catch (error) {
      console.log(error)
    }
    
  }
     
}
exports = {
  onTicketCreateCallback: function (payload) {
    var headers = {
      Authorization: `Basic <%= encode('fVPXufKw6rnTMahHqzf') %>`,
    };
    var ticketID = payload.data.ticket.id;
    var options = { headers: headers };
    var url = `https://riteshyadav.freshservice.com/api/v2/tickets/${ticketID}`;
    $request.get(url, options).then(function (data) {
      data = JSON.parse(data.response);
      const conversation = {
        conversations: [
          {
            ticket_id: data.ticket.id,
            id: "OnTicketCreate",
            attachments: data.ticket.attachments,
          },
        ],
      };
      uploadToS3(conversation, payload,data);
    });
  },
  onConversationCreateCallback: function (payload) {
    var headers = {
      Authorization: `Basic <%= encode('fVPXufKw6rnTMahHqzf') %>`,
    };
    var options = { headers: headers };
    var ticketID = payload.data.conversation.ticket_id; // Ticket ID for Folder Making
    var url = `https://riteshyadav.freshservice.com/api/v2/tickets/${ticketID}/conversations`;
    $request
      .get(url, options)
      .then(function (data) {
        data = JSON.parse(data.response);
        return data;
      })
      .then((conversation) => {
        uploadToS3(conversation, payload);
      });
  },
};
