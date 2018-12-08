'use strict';

var address = "http://73.154.255.201";
var port = "8081";
var token;

function displayMessage(data)
{
	var chatBox = $("#chatBox");
	var atBottom = chatBox.scrollTop() === (chatBox[0].scrollHeight - chatBox.height());
	chatBox.append($("<p></p>").text(data.name + ": " + data.content));
	if (atBottom)
	{
		chatBox.scrollTop(chatBox[0].scrollHeight - chatBox.height());
	}
}

function addUser(data)
{
	$("#connected-list").append($("<li class='list-group-item'></li>").text(data.name).attr("id", "connected-" + data.name));
}

function removeUser(data)
{
	$("#connected-list > #connected-" + data.name).first().remove();
}

$(document).ready(function()
{
	$("#txtName").focus();
	
	$("#btnPickName").on("click", function()
	{
		
		var name = $("#txtName").val();
		var password = $("#txtPassword").val();
		if (name.length > 0 && password.length > 0)
		{
			var action = $('input[name="login/register"]:checked').val();
			$.ajax(
			{
				url: address + ":" + port + "/" + action + "/" + name + "/" + password,
				method: "POST",
				success: function(data)
				{
					if (data.type === "token")
					{
						token = data.content;
						$("#nameBox").hide();
						$("#messageBox").show();
						var chatSource = new EventSource(address + ":" + port + "/open/" + token);
						chatSource.onmessage = function(event)
						{
							var data = JSON.parse(event.data)
							console.log(data);
							if (data.type == "message") displayMessage(data);
							else if (data.type == "connect") addUser(data);
							else if (data.type == "disconnect") removeUser(data);
						}
						$('#txtMessage').focus();
					}
					else if (action === "register")
					{
						$('#loginError').html("That name is taken. Please choose a different name.");
					}
				},
				error: function(req, status, err)
				{
					if (action === "join")
					{
						$('#loginError').html("Login credentials are not valid.");
					}
				}
			});
		}
	});
	
	$(document).keypress(function(e){
		if (e.which == 13)
		{
			e.preventDefault();
			var txtMessage = $("#txtMessage");
			var txtName = $("#txtName");
			if ($(document.activeElement).is("#txtMessage") && txtMessage.text().length > 0)
			{
				$.ajax(
				{
					url: address + ":" + port + "/send/" + token,
					method: "POST",
					data:
					{
						"message": txtMessage.text()
					},
					success: function()
					{
						txtMessage.text("");
					}
				});
			}
			else if (txtName.is(":focus"))
			{
				$("#btnPickName").trigger("click");
			}
		}
	});
});
