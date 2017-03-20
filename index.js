(function($){ 
	W = window;
	W.CHAT = { 
		userid : null,
		username : null,
		socket : null,
		genUid : function(){ 
			return new Date().getTime()+""+Math.floor(Math.random()*899 +100);
		},
		usernameSubmit : function(){ 
			var cookie_username = $.cookie('username');
			var cookie_userid = $.cookie('userid');
			
			var username = cookie_username ? cookie_username : $('#username').val();
			
			if($.trim(username).length != 0){
				var user ={};
				if(cookie_userid){
					user.userid = cookie_userid;
				}
				user.username = username;
				$('#username').val('');
				$('#login_panel').hide();
				$('#chat_panel').show(); 
				this.init(user);
			}
		},
		//更新系统消息，本例中在用户加入、退出的时候调用
		updateSysMsg : function(o,action){ 
			//当前用户列表：
			var onlineUsers = o.onlineUsers;
			var onlineCount = o.onlineCount;
			//新加入的用户消息
			var user =  o.user;

			$.cookie('username',user.username);
			$.cookie('userid',user.userid);
			//更新在线人数
			var userhtml = '';
			var separator = '';
			for(key in onlineUsers){
				if(onlineUsers.hasOwnProperty(key)){ 
					userhtml += separator + onlineUsers[key];
					separator = "、";
				}
			}
			$('#online_count').html("当前共有"+onlineCount+"人在线，在线列表:"+userhtml);

			//添加系统消息
			var html = '';
			html += '<p class="text-muted text-center" data-role="msg-system">';
			html += 
			html += user.username;
			html +='加入了聊天室！</p>';
			$(html).appendTo('#message');

		},
		submit:function(){
			//console.log('message init');
			
			var content = $('#message_content').val();
			if($.trim(content).length != 0){ 
				var obj = {
					userid : this.userid,
					username : this.username,
					content : content
				}
				$('#message_content').val('');
				this.socket.emit('message',obj);
			}
			return false;
		},
		init : function(user){
			this.userid = user.userid ? user.userid : this.genUid();
			this.username = user.username;
			this.socket = io.connect('http://localhost:3000');
			//告诉服务器有用户登陆
			this.socket.emit('login',{userid :this.userid,username:this.username})
			//监听用户登陆
			this.socket.on('login',function(o){ 
				CHAT.updateSysMsg(o,'login');
			})

			//监听发送消息
			this.socket.on('message',function(obj){ 
				var isme = (obj.userid == CHAT.userid) ? true : false;

				var content_html = '<div class="popover '+(isme ? 'left' : 'right')+'" >'
				content_html += '<div class="arrow"></div>';
				content_html += '<div class="popover-content"><p>'+obj.content+'</p></div>';
				content_html += '</div>';

				var heading_html = '<div class="message_title pull-'+(isme ? 'right' : 'left')+'">';
				heading_html += '<a herf="#">'+obj.username+'</a>';
				heading_html +=	'</div>';

				var html = '<div class="item">'
				if(isme){
					html += content_html;
					html += heading_html;
				}else{ 
					html += heading_html;
					html += content_html;
				}
				html += '</div>';


				
				$('#message').append($(html));


				$('.item').each(function(i,v){ 
					var height = parseInt($(this).find('.popover').height())+20
					$(this).css('height',height+'px');
					//console.log($(this).find('.popover').outHeight());
				})
			});
		},
		load : function(){ 
			this.usernameSubmit();
		}
	}

	//通过回车来提交用户名
	$('#username').on('keydown',function(e){ 
		if(e.keyCode == 13){ 
			CHAT.usernameSubmit();
		}
	})
	$('#message_content').on('keydown',function(e){ 
		if(e.keyCode == 13){ 
			CHAT.submit();
		}
	})
	$('#login_btn').click(function(){ 
		CHAT.usernameSubmit();
	})

	$('#message_btn').click(function(){ 
		CHAT.submit();
	})

	CHAT.load();
})(jQuery);
