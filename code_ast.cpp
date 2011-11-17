#include <cstdio>

#include "code_ast.hpp"

using namespace llvm;
using namespace std;

//SimpleNode
SimpleNode::SimpleNode(){}

SimpleNode::SimpleNode(std::string uniqueId, std::string type, std::string op, std::string args ){
	this -> uniqueId = atoi( uniqueId.c_str() );

	if( type.compare( "OP" ) == 0 ){
		this -> type = OP;
	} else if( type.compare( "VAR" ) == 0 ){
		this -> type = VAR;
	} else if( type.compare( "CONST" ) == 0 ){
		this -> type = CONST;
	} else if( type.compare( "TYPE" ) == 0 ){
		this -> type = TYPE;
	}

	if( op.compare( "NONE" ) == 0 ){
		this -> op = NONE;
	} else if( op.compare( "ADD" ) == 0 ){
		this -> op = ADD;
	} else if( op.compare( "OR" ) == 0 ){
		this -> op = OR;
	} else if( op.compare( "XOR" ) == 0 ){
		this -> op = XOR;
	} else if( op.compare( "AND" ) == 0 ){
		this -> op = AND;
	} else if( op.compare( "SUB" ) == 0 ){
		this -> op = SUB;
	} else if( op.compare( "MUL" ) == 0 ){
		this -> op = MUL;
	} else if( op.compare( "DIV" ) == 0 ){
		this -> op = DIV;
	} else if( op.compare( "MOD" ) == 0 ){
		this -> op = MOD;
	} else if( op.compare( "UNR" ) == 0 ){
		this -> op = UNR;
	} else if( op.compare( "NEG" ) == 0 ){
		this -> op = NEG;
	} 

	this -> data = args;
}

void SimpleNode::debug(){
	printf( "#%d - %d - %d: %s\n", uniqueId, type, op, data.c_str() );
}

NodeType SimpleNode::getType(){
	return type;
}

OPType SimpleNode::getOP(){
	return op;
}

int SimpleNode::getId(){
	return uniqueId;
}

string SimpleNode::getData(){
	return data;
}

//Node
Node * Node::createAST( std::map<int, SimpleNode*>& sn ){
	std::list<std::pair<int, int> > connectionsQueue;
	std::list<std::pair<int, int> >::iterator conIt;

	std::map<int, SimpleNode*>::iterator it = sn.begin();
	std::map<int, Node*> nodes;
	
	//Generate root of AST
	Node * root;

	switch( (*it).second -> getType() ){
		case OP: 	root = Node::createOPNode( *(*it).second, connectionsQueue ); break;
		case VAR: 	root = Node::createVARNode( *(*it).second, connectionsQueue ); break;
		case CONST: root = Node::createCONSTNode( *(*it).second, connectionsQueue ); break;
		case TYPE:	root = Node::createTYPENode( *(*it).second, connectionsQueue );  break;
		default: break;
	}

	nodes[root -> getId()] = root;
	it++;

	SimpleNode* processed;
	Node* newNode;

	//Generate children

	/*while( it != sn.end() ){
		processed = ( (*( ++it )).second );

		switch( processed -> getType() ){
			case OP: 	newNode = Node::createOPNode( *(*it).second, connectionsQueue ); break;
			case VAR: 	newNode = Node::createVARNode( *(*it).second, connectionsQueue ); break;
			case CONST: newNode = Node::createCONSTNode( *(*it).second, connectionsQueue ); break;
			case TYPE:	newNode = Node::createTYPENode( *(*it).second, connectionsQueue );  break;
			default: break;
		}

		nodes[newNode -> getId()] = newNode;

		it++;
	}*/


	//build AST :)
	printf("Connections:\n");
	for( conIt = connectionsQueue.begin(); conIt != connectionsQueue.end(); conIt++ ){
		
		//DEBUG
		printf( "%d -> %d\n", (*conIt).first, (*conIt).second );
		/*
		if( nodes.find( ( *conIt ).first ) != nodes.end() && nodes.find( ( *conIt ).second ) != nodes.end() ){
			nodes[( *conIt ).first] -> addChild( nodes[( *conIt ).second] ); // always add to the right
		} else {
			//ERROR: missing node?!
		}*/
	}

	//free memory
	/*for( it = sn.begin(); it != sn.end(); it++ ){
		delete ( *it ).second;
	}*/	

	return root;
}

Node * Node::createOPNode( SimpleNode& simpleNode, std::list<std::pair<int, int> >& connections ){
	Node * node = new OPNode( simpleNode );

	std::size_t pos;

	int childId;
	std::string childIdRaw;
	string data = node -> getData(); 

	while( data.length() > 0 && std::string::npos != ( pos = ( node -> getData() ).find( "," ) ) ){
		childIdRaw = data.substr( 0, pos );

		printf( "CID %s\n", childIdRaw.c_str() );

		childId = atoi( childIdRaw.c_str() );


		connections.push_back(make_pair(node -> getId(), childId));

		data = data.substr( pos + 1 );
	}

	return node;
}

//VARNode
Value* VARNode::codeGen(){
  	//return NamedValues[id];
}

//CONSTNode

Value* CONSTNode::codeGen(){
	switch( this -> varType ){
		case STRING: return CONSTNode::codeGenSTRING( *this ); break;
		case NUMBER: return CONSTNode::codeGenNUMBER( *this ); break;
	}
}

/*Value* CONSTNode::codeGenSTRING(){
	return ConstantArray::get( TheModule->getContext(), valueString, true);

Value* CONSTNode::codeGenNUMBER(){
	return ConstantInt::get( TheModule->getContext(), APInt( valueInt ) );
}*/
OPNode::OPNode( SimpleNode& s){
	uniqueId = s.getId();
	type = s.getType();
	op = s.getOP();
	data = s.getData();
}

Value* OPNode::codeGen(){
	lhs = children[0].codeGen();
	rhs = children[1].codeGen();
	
	switch( this -> op ){
		case ADD: return OPNode::codeGenADD( *this ); break;
		case OR: return OPNode::codeGenADD( *this ); break;
		case XOR: return OPNode::codeGenADD( *this ); break;
		case AND: return OPNode::codeGenADD( *this ); break;
		case SUB: return OPNode::codeGenADD( *this ); break;
		case MUL: return OPNode::codeGenADD( *this ); break;
		case DIV: return OPNode::codeGenADD( *this ); break;
		case UNR: return OPNode::codeGenADD( *this ); break;
		case NEG: return OPNode::codeGenADD( *this ); break;
	}
}

Value* OPNode::codeGenADD( OPNode & n ){
	return Builder.CreateAdd( n.lhs, n.rhs );
}

Value* OPNode::codeGenOR( OPNode & n ){
	return Builder.CreateOr( n.lhs, n.rhs );
}

Value* OPNode::codeGenXOR( OPNode & n ){
	return Builder.CreateXor( n.lhs, n.rhs );
}

Value* OPNode::codeGenAND( OPNode & n ){
	return Builder.CreateAnd( n.lhs, n.rhs );
}

Value* OPNode::codeGenSUB( OPNode & n ){
	return Builder.CreateSub( n.lhs, n.rhs );
}

Value* OPNode::codeGenMUL( OPNode & n ){
	return Builder.CreateMul( n.lhs, n.rhs );
}

Value* OPNode::codeGenDIV( OPNode & n ){
	return Builder.CreateUDiv( n.lhs, n.rhs ); //unsigned 
}

Value* OPNode::codeGenUNR( OPNode & n ){
	//need to think about it;
	return 0;
}

Value* OPNode::codeGenNEG( OPNode & n ){
	return Builder.CreateNeg( n.lhs );
}