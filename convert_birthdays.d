import std;

void main(string[] args)
{
	string[2][] parts;

	auto output = File("index.html", "w");
	auto input = readText("index-template.html").findSplit("___MESSAGES___");
	output.write(input[0]);

	int numPushed;
	void push()
	{
		if (parts.length)
		{
			output.write(`<div class="message"`);
			if (numPushed != 0)
				output.write(` style="display:none"`);
			output.writeln("><div>");
			
			foreach (i, part; parts)
				output.writeln(i == 0 ? makeMessage(part[0], part[1]) : makeMessage(part[1]));
			output.writeln("</div></div>");

			numPushed++;
			parts = null;
		}
	}

	int i;
	foreach (line; File("Birthdays.txt", "r").byLine)
	{
		i++;
		if (!line.strip.length)
		{
			push();
		}
		else
		{
			auto msg = line.findSplit("—");
			if (!msg[2].length)
			{
				parts[$ - 1][1] ~= "\n<br/>" ~ line;
			}
			else
			{
				auto author = msg[0];
				auto message = msg[2];

				parts ~= [author.idup, message.idup];
			}
		}
	}

	push();

	output.write(input[2]);
}

string makeMessage(scope const(char)[] author, scope const(char)[] message)
{
	return format!`<div class="from">%sさん</div><div class="msg">%s</div>`(author.strip, message.strip);
}

string makeMessage(scope const(char)[] message)
{
	return format!`<div class="msg">%s</div>`(message.strip);
}