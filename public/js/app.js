/**
 * @jsx React.DOM
 */
var socket = io.connect();

var Messages = [];

var Message = React.createClass({
	render: function(){
		return(
			<div class="message">
				<strong>{this.props.user}</strong> :
				{this.props.text}		
			</div>
		)
	}
});

var MessageList = React.createClass({
	render: function(){
		var renderMessage = function(message){
			return <Message user={message.user} text={message.text} />
		}
		return (
			<div class='messages'>
				<h2 class="title"> Conversation: </h2>
				<div class="content form-control">
					{ this.props.messages.map(renderMessage)} 
				</div>
			</div>
		);
	}
});

var MessageForm = React.createClass({

	getInitialState: function(){
		return {text: ''};
	},

	handleSubmit : function(e){
		e.preventDefault();
		var message = {
			user : this.props.user,
			text : this.state.text
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler : function(e){
		this.setState({ text : e.target.value });
	},

	render: function(){
		return(
			<div class='message_form'>
				<form onSubmit={this.handleSubmit}>
					<input class="form-control" placeholder="What would you like to say" onChange={this.changeHandler} value={this.state.text} />
				</form>
			</div>
		);
	}
});


var ChatApp = React.createClass({

	getInitialState: function(){

		socket.on('init', this.initialize);
		socket.on('send:message', this.messageRecieve);
		socket.on('user:join', this.userJoined);
		socket.on('user:left', this.userLeft);
		socket.on('change:name', this.userChangedName);

		return {users: [], messages:[], text: ''};
	},

	initialize: function(data){
		this.setState({ users: data.users, user: data.name});
	},

	messageRecieve: function(message){
		this.state.messages.push(message);
		this.setState();
	},

	userJoined: function(data){
		this.state.users.push(data.name);
		this.state.messages.push({
			user: 'APLICATION BOT',
			text : data.name +' Joined'
		});
		this.setState();
	},

	userLeft: function(data){
		var index = this.state.users.indexOf(data.name);
		this.state.users.splice(index, 1);
		this.state.messages.push({
			user: 'APLICATION BOT',
			text : data.name +' Left'
		});
		this.setState();

	},

	handleMessageSubmit : function(message){
		this.state.messages.push(message);
		this.setState();

		socket.emit('send:message', message);
	},


	render : function(){
		return (
			<div class="container">
				<div class="row">
					<div class="col-md-12">				
						<MessageList messages={this.state.messages} />
					</div>
				</div>
				<div class="row">
					<div class="col-md-12">	
						<MessageForm onMessageSubmit={this.handleMessageSubmit} user={this.state.user} />
					</div>
				</div>
			</div>
		);
	}
});

React.renderComponent(<ChatApp/>, document.body);