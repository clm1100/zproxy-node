<style>
	section {
		border-bottom: 1px solid green;
	}
	section > header {
		font-size:10px;
	}
	section > header > h1 {
		font-size: 16px;
		color: black;
		font-weight: bold;
	}
	h3 {
		font-size: 12px;
	}
</style>
<section>
	<header>
		<h1>Error Summary:</h1>
	</header>
	<div>
	    <h3>Type: <%= error.type%></h3>
	    <h3>Message: <%- error.message%></h3>
	    <h3>Stack: </h3>
		<pre>
<%= error.stack%>
	    </pre>
	</div>
</section>

<section>
	<header>
		<h1>Process Summary:</h1>
	</header>
	<div>
	    <h3>PID: <%= process.pid%></h3>
	    <h3>Name: <%= process.title%></h3>
	    <h3>Mode: <%= process.env.NODE_ENV%></h3>
		<pre>
uptime: <%= process.uptime()%>
		</pre>
	</div>
</section>

<section>
	<header>
		<h1>Request Summary:</h1>
	</header>
	<div>
	    <h3>URL: <%= request.url%>(<%= request.method%>)</h3>
	    <h3>Client IP: <%= request.ip%></h3>
	    <h3>Parameters: </h3>
	    <div>
		<%
	    	for(var key in request.body) {
	    		print(key);
	    		print(": ");
	    		var data = request.body[key];
	    		if(!_.isString(data)) {
	    			data = JSON.stringify(data);
	    		}
	    		%>
	    		<%- data%>
	    		<%
	    		print("</br>");
	    	}

	    %>
	    </div>
	</div>
</section>