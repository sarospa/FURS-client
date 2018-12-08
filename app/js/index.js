'use strict';

var address = "http://73.154.255.201";
var port = "8081";
var name;

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
	$("#btnPickName").on("click", function()
	{
		name = $("#txtName").val();
		if (name.length > 0)
		{
			$("#nameBox").hide();
			$("#messageBox").show();
			var chatSource = new EventSource(address + ":" + port + "/join/" + name);
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
					url: address + ":" + port + "/send",
					method: "POST",
					data:
					{
						"name": name,
						"message": txtMessage.text()
					}
				});
				txtMessage.text("");
			}
			else if (txtName.is(":focus"))
			{
				$("#btnPickName").trigger("click");
			}
		}
	});
});
