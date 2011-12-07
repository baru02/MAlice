{

	Array.prototype.isArray = true;

	counter = 0

	function NODE() {
		var id;
		var type;
		var value;
		var numberOfChildren;
		var children;
	};

	//Management functions
	function createNode( type, value, children ) {
		var n = new NODE();
		n.id = counter++;
		n.type = type;
		n.value = value;	
		n.children = new Array();
		
		for( var i = 2; i < arguments.length; i++ ) {
			if(arguments[i].isArray) {
				n.children = n.children.concat(arguments[i]);	
			} else {	
				if(arguments[i] !== '' ) {
								n.children.push( arguments[i] );
				}
			}
		}

		n.numberOfChildren = n.children.length;

		return n;
	};

	NODE_ROOT		= "ROOT"
	NODE_OP			= "OPERATOR"
	NODE_VAR		= "VARIABLE"
	NODE_CONST		= "CONSTANT"
	NODE_TYPE		= "TYPE"
	NODE_RETURN 	= "RETURN"
	NODE_IO			= "IO"
	NODE_LOOP 		= "WHILE"
	NODE_LOOP_END 	= "WHILE_END"
    NODE_FUN 		= "FUNCTION"
    NODE_FUN_DEF 	= "FUNCTION_DEFINITION"
    NODE_IF			= "IF"
    NODE_ELSE       = "ELSE"
    NODE_ELSE_IF    = "ELSE_IF"
    NODE_FUN_CALL   = "FUNCTION_CALL"
    NODE_LOOK_DEF   = "LOOKING_GLASS"
    NODE_END_IF     = "END_IF"
    NODE_VAR_ARRAY  = "ARRAY"
    NODE_STRING		= "STRING"


	OP_NONE		= "NO_OP"
	OP_ADD      = "ADD"
	OP_OR		= "OR"
	OP_XOR		= "XOR"
	OP_AND		= "AND"
	OP_SUB		= "SUBTRACT"
	OP_MUL		= "MULTIPLY"
	OP_DIV		= "DIVIDE"
	OP_MOD		= "MOD"
	OP_NOT		= "NOT"
	OP_NEG		= "NEGATE"
	OP_LOR		= "LOGICAL_OR"
	OP_LAND		= "LOGICAL_AND"
	OP_EQ		= "EQUAL"
	OP_UEQ		= "NOT_EQUAL"
	OP_LT		= "LOWER_THAN"
	OP_GT		= "GREATER_THAN"
	OP_LTE		= "LOWER_THAN_EQUAL"
	OP_GTE		= "GREATER_THAN_EQUAL"

}

start
= program:root* { return createNode(NODE_ROOT, "0", program);}

root
= loop_block
/ if_block
/ func_block
/ func_call
/ io_line
/ assignment_line

function_body
= instructions*

instructions
= loop_block
/ if_block
/ func_call
/ io_line
/ assignment_line

if_block
= space name:ifFun space cond:condition space 'so' space [\n]* space ifB:root* ifE:ifelse { return createNode(NODE_IF, "if", cond, ifB, ifE)}

ifelse
= space 'or' space [\n]* ifBody:function_body ife:ifelse { return createNode(NODE_ELSE, "else", ifBody, ife)}
/ space 'or maybe' space cond:condition space 'so' space [\n]* ifBody:function_body ife:ifelse { return createNode(NODE_ELSE_IF, "else if", cond, ifBody, ife)}
/ space unsure newLine { return createNode( NODE_END_IF, "endif" ) }

func_call
= fun:function newLine { return fun; }
/ fun:function separator { return fun; }

function
= space identifier:id space '(' arglist:argument_fun* ')' space { return createNode(NODE_FUN_CALL, "function_call", identifier, arglist)}
/ space arg:id space 'went through' space identifier:id { return createNode(NODE_FUN_CALL, "function_call_by_reference", arg, identifier)}

argument_fun
= space arg:legalArgs separator? space { return arg }

func_block
= space 'The room' space def:function_type 'contained a' space type:typeName [\n]* funcB:function_body { return createNode( NODE_FUN_DEF, "function_definition", type, def, funcB) }
/ space 'The Looking-Glass' space identifier:id space 'changed a' space type:typeName [\n]* funcB:function_body { return createNode( NODE_LOOK_DEF, identifier, type, funcB)}

function_type
= identifier:id space '(' arglist:argument_type* ')' space { return createNode(NODE_FUN, "function", identifier, arglist)}

argument_type
= space stype:spiderType? space type:typeName space identifier:id separator? space {  return createNode( NODE_TYPE, "argument", identifier, type, stype ) }

loop_block
= space 'eventually' space cond:condition space 'because' space [\n]* loop:function_body space [\n]* space 'enough' space 'times' newLine { return createNode( NODE_LOOP, "while", cond, loop )}

io_line
= single:io separator { return single }
/ single:io newLine { return single }

io
= space arg:legalArgs space name:function_output space 'Alice' { return createNode( NODE_IO, name, arg)}
/ space arg:legalArgs space name:function_output { return createNode(NODE_IO, name, arg)}
/ space 'Alice' space 'found' space arg:legalArgs space { return createNode(NODE_IO, 'found', arg)}
/ space name:function_input space arg:argument { return createNode(NODE_IO, name, arg)} 

legalArgs
= fun:function {return fun}
/ expr:expression {return expr}
/ arg:argument {return arg}
/ str:string {return str}

assignment_line 
= single:assignment separator { return single }
/ single:assignment newLine { return single }

assignment
= space identifier:id space name:function_name space type:typeName {  return createNode( NODE_VAR, name, identifier, type ) }
 / space arg:argument space name:function_name space expr:legalArgs {  return createNode( NODE_VAR, name, arg, expr ) }
 / space identifier:id space name:function_name {  return createNode( NODE_VAR, name, identifier ) }
/ space identifier:id space 'had' space expr:expression space type:typeName {  return createNode( NODE_VAR_ARRAY, "array", identifier, expr, type ) }

expression
= logical_or_exp

logical_or_exp
=  laExpr:logical_and_exp space '||' space loExpr:logical_or_exp {  return createNode(NODE_OP, OP_LOR, laExpr, loExpr) }
/ logical_and_exp

logical_and_exp	
= orExpr:or_expression space '&&' space laExpr:logical_and_exp {  return createNode(NODE_OP, OP_LAND, orExpr, laExpr) }
/ or_expression

or_expression
= xorExpr:xor_expression space '|' space orExpr:or_expression {  return createNode( NODE_OP, OP_OR, xorExpr, orExpr ) }
/ xor_expression

xor_expression
= andExpr:and_expression space '^' space xorExpr:xor_expression {  return createNode( NODE_OP, OP_XOR, andExpr, xorExpr ) }
/ and_expression

and_expression
= eqExpr:equality_exp space '&' space andExpr:and_expression {  return createNode( NODE_OP, OP_AND, eqExpr, andExpr) }
/ equality_exp

equality_exp
= relExpr:relational_exp space '==' space eqExpr:equality_exp {  return createNode(NODE_OP, OP_EQ, relExpr, eqExpr) }
/ relExpr:relational_exp space '!=' space eqExpr:equality_exp {  return createNode(NODE_OP, OP_UEQ, relExpr, eqExpr) }
/ relational_exp

relational_exp
= addExpr:add_expression space '<' space relExpr:relational_exp {  return createNode(NODE_OP, OP_LT, addExpr, relExpr) }
/ addExpr:add_expression space '>' space relExpr:relational_exp {  return createNode(NODE_OP, OP_GT, addExpr, relExpr) }
/ addExpr:add_expression space '<=' space relExpr:relational_exp {  return createNode(NODE_OP, OP_LTE, addExpr, relExpr) }
/ addExpr:add_expression space '>=' space relExpr:relational_exp  {  return createNode(NODE_OP, OP_GTE, addExpr, relExpr) }
/ add_expression

add_expression
= notExpr:not_expression space '+' space addExpr:add_expression {  return createNode(NODE_OP, OP_ADD, notExpr, addExpr) }
/ notExpr:not_expression space '-' space addExpr:add_expression {  return createNode(NODE_OP, OP_SUB, notExpr, addExpr ) }
/ not_expression

not_expression
= notExpr:not_op space mulExpr:mul_expression { return createNode(NODE_OP, notExpr, mulExpr)}
/ mul_expression

mul_expression
= unExpr:unary_expression space '*'  space mulExpr:mul_expression  {  return createNode(NODE_OP, OP_MUL, unExpr, mulExpr) }
/ unExpr:unary_expression space '/' space mulExpr:mul_expression {  return createNode(NODE_OP, OP_DIV, unExpr, mulExpr) }
/ unExpr:unary_expression space '%' space mulExpr:mul_expression  {  return createNode(NODE_OP, OP_MOD, unExpr, mulExpr) }
/ unary_expression

unary_expression
= unOP:neg_op primExpr:primitive_expression {  return createNode(NODE_OP, unOP, primExpr ) }
/ primExpr:primitive_expression

primitive_expression
= num:[0-9]+ {  return createNode( NODE_CONST, num.join(""), createNode( NODE_TYPE, "number" ) ) }
/ letter:([\'][^\'][\']) { return createNode( NODE_CONST, letter[1], createNode( NODE_TYPE, "letter" ) ) }
/ fun:function {return fun}
/ arg:argument {return arg}
/ str:string {return str}
/ space '(' space expr:expression space ')' space { return expr; }

typeName
= type:'letter' { return createNode( NODE_TYPE, type ); }
/ type:'number' { return createNode( NODE_TYPE, type ); }
/ type:'sentence' { return createNode( NODE_TYPE, type ); }
 
spiderType
= type:'spider' { return createNode( NODE_TYPE, type ); }

id
= identifierFirst:[A-Za-z] identifierRest:[0-9A-Za-z_]* { return createNode( NODE_VAR, identifierFirst + identifierRest.join("") ) }

argument
= identifier:id "\'s" space expr:expression space 'piece' { return createNode( NODE_VAR_ARRAY, "array_element", identifier, expr ) }
/ id

string
= ([\"] str:[^\"]* [\"]) { return createNode( NODE_STRING, str.join("") ) }

condition
= '(' space expr:expression space ')' { return expr }

function_name
= funcName:'was a ' { return funcName }
/ funcName:'became ' { return funcName }
/ funcName:'drank' { return funcName }
/ funcName:'ate' { return funcName }

function_input
= funcName:'what was' { return funcName }

function_output
= funcName:'said' { return funcName }
/ funcName:'thought' { return funcName }
/ funcName:'spoke' { return funcName }

ifFun
= "either"
/ "perhaps"

unsure
= "Alice was unsure which"
/ "Alice was unsure"

newLine
= (space [\n\t]* space [\.\,\?] space [\n\t]*) { return }
/ (space 'too' space [\.] space [\n]*) { return }
/ (space 'and' space [\n]*) { return }
/ (space 'but' space [\n]*) { return }

space
= [ \t]* { return }

separator
= ([\,] space [\n]) { return }
/ ([\,]) { return }
/ ([?][ ]) { return }
/ ([ ]'then'[ ]) { return }
/ ([ ]'or'[ ]) { return }
/ ([ ]'and'[ ]) { return }
/ ([ ]'too'[ ]) { return }
/ ([ ]'but'[ ]) { return }

not_op
= '~' { return OP_NOT }

neg_op
= '-' { return OP_NEG }