#ifndef AST_H_GUARD
#define AST_H_GUARD

#include <string>
#include <vector>
#include <map>
#include <utility>
#include <list>

#include "llvm/LLVMContext.h"
#include "llvm/Module.h"
#include "llvm/DerivedTypes.h"
#include "llvm/Constants.h"
#include "llvm/Instructions.h"
#include "llvm/Analysis/Verifier.h"
#include "llvm/Support/IRBuilder.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/Target/TargetSelect.h"

enum NodeType {OP = 0, VAR, CONST, TYPE};
enum OPType {NONE = 0, ADD, OR, XOR, AND, SUB, MUL, DIV, MOD, UNR, NEG};
enum VarType {STRING = 0, NUMBER};

static llvm::Module *theModule;
static llvm::IRBuilder<> Builder;
/*
typedef Value* Valueptr
typedef Value * (*OPGenFunction)( *Module, *Builder );

class SymbolTable{
	
};
*/
class SimpleNode{
	public:
		SimpleNode();
		SimpleNode( std::string, std::string, std::string, std::string );

		NodeType getType();
		OPType getOP();
		int getId();
		std::string getData();

		void debug();
	protected:
		int uniqueId; 

		//general
		NodeType type;
		OPType op;
		
		//data left to parse
		std::string data;


};

class Node : public SimpleNode{
	public:
		Node(){};
		virtual ~Node(){};
		Node( SimpleNode& );
		virtual llvm::Value *codeGen() = 0;
		void addChild( Node* );

		static Node * createAST( std::map<int, SimpleNode*> & ); //Factory
		
		VarType getVarType();
		void setVarType( VarType );
		
		std::string getValueString();
		void setValueString( std::string );
		
		int getValueNumber();
		void setValueNumber( int );
				
		void debug();
	protected:
		

		static Node * createOPNode( SimpleNode&, std::list<std::pair<int, int> >& );
		static Node * createVARNode( SimpleNode&, std::list<std::pair<int, int> >& ){};
		static Node * createCONSTNode( SimpleNode&, std::list<std::pair<int, int> >& );
		static Node * createTYPENode( SimpleNode&, std::list<std::pair<int, int> >& ){};

		//TODO: decide which fields to leave here, and which to move down
		std::string id;
		VarType varType;
		
		//values
		int valueNumber;
		std::string valueString;

		//children
		std::vector<Node*> children;

};

class OPNode : public Node{
	public:
		OPNode(){};
		OPNode( SimpleNode& );
		llvm::Value *codeGen();

	protected:

		llvm::Value *lhs;
		llvm::Value *rhs;

		static llvm::Value *codeGenADD( OPNode& );
		static llvm::Value *codeGenOR( OPNode& );
		static llvm::Value *codeGenXOR( OPNode& );
		static llvm::Value *codeGenAND( OPNode& );
		static llvm::Value *codeGenSUB( OPNode& ); 
		static llvm::Value *codeGenMUL( OPNode& );
		static llvm::Value *codeGenDIV( OPNode& );
		static llvm::Value *codeGenUNR( OPNode& );
		static llvm::Value *codeGenNEG( OPNode& );
};

class VARNode : public Node{
		public:
		VARNode();
		VARNode( SimpleNode& s){};
		llvm::Value *codeGen();
};

class CONSTNode : public Node{
	public:
		CONSTNode();
		CONSTNode( SimpleNode& s);
		llvm::Value *codeGen();	

	protected:

		static llvm::Value *codeGenSTRING( CONSTNode& );
		static llvm::Value *codeGenNUMBER( CONSTNode& );
};

class TYPENode : public Node{
	public:
		TYPENode();
		TYPENode( SimpleNode& s){};
		llvm::Value *codeGen();	
};

#endif