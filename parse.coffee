parser = require './parser.js'
semantics = require './semanticAnalyser.coffee'
sys = require 'sys'
fs = require 'fs'

arguments = process.argv.splice 2

source = fs.readFileSync arguments[0], 'utf-8'
source = source.replace /([ ]{2,}|[\t\r]+)/g, ' '

try
	parseTree = parser.parse source
	labelTree = semantics.analyse parseTree
catch e
	#if e instanceof parser.SyntaxError
		#We've encountered Syntax error
	#if e instanceof semantics.SemanticError
		#We've encountered semantic error
	throw e

console.log parseTree

sys.puts semantics.buildtree parseTree


#console.log labelTree