import { hash } from '../utils';

// type Number = [int, float, complex]
export type Expression = [Expr, Number];

/**
    Given 'P |'==>'| Q, first form PartialExpr('==>', P), then combine with Q."""
*/
export class PartialExpr {
	constructor(public op: string, public lhs: Expr) {}

	or(rhs) {
		return new Expr(this.op, this.lhs, rhs);
	}

	repr() {
		return `new PartialExpr('${this.op}', this.lhs)`;
	}
}

/**
    A mathematical expression with an operator and 0 or more arguments.
    op is a str like '+' or 'sin'; args are Expressions.
    Expr('x') or Symbol('x') creates a symbol (a nullary Expr).
    Expr('-', x) creates a unary; Expr('+', x, 1) creates a binary.
*/
export class Expr {
	args: any[];
	constructor(public op: string | Expr, ...args: any[]) {
		this.args = args;
	}

	hasArgs() {
		return this.args && this.args.length > 0;
	}

	neg() {
		// return new Expr('-', self);
		return new Expr('-', this);
	}

	pos() {
		return new Expr('+', this);
	}

	invert() {
		return new Expr('~', this);
	}

	add(rhs) {
		return new Expr('+', this, rhs);
	}

	sub(rhs) {
		return new Expr('-', this, rhs);
	}

	mul(rhs) {
		return new Expr('*', this, rhs);
	}

	pow(rhs) {
		return new Expr('**', this, rhs);
	}

	mod(rhs) {
		return new Expr('%', this, rhs);
	}

	and(rhs) {
		return new Expr('&', this, rhs);
	}

	xor(rhs) {
		return new Expr('^', this, rhs);
	}

	rshift(rhs) {
		return new Expr('>>', this, rhs);
	}

	lshift(rhs) {
		return new Expr('<<', this, rhs);
	}

	truediv(rhs) {
		return new Expr('/', this, rhs);
	}

	floordiv(rhs) {
		return new Expr('//', this, rhs);
	}

	matmul(rhs) {
		return new Expr('@', this, rhs);
	}

	/**
    Allow both P | Q, and P |'==>'| Q."""
    */
	or(rhs) {
		// if isinstance(rhs, Expression):
		//     return Expr('|', self, rhs)
		// else:
		//     return PartialExpr(rhs, self)
		//
		//    # Reverse operator overloads

		// if (rhs instanceof Expression) {
		if (rhs instanceof Expr) {
			return new Expr('|', this, rhs);
		} else {
			return new PartialExpr(rhs, this);
		}
	}

	radd(lhs) {
		return new Expr('+', lhs, this);
	}

	rsub(lhs) {
		return new Expr('-', lhs, this);
	}

	rmul(lhs) {
		return new Expr('*', lhs, this);
	}

	rdiv(lhs) {
		return new Expr('/', lhs, this);
	}

	rpow(lhs) {
		return new Expr('**', lhs, this);
	}

	rmod(lhs) {
		return new Expr('%', lhs, this);
	}

	rand(lhs) {
		return new Expr('&', lhs, this);
	}

	rxor(lhs) {
		return new Expr('^', lhs, this);
	}

	ror(lhs) {
		return new Expr('|', lhs, this);
	}

	rrshift(lhs) {
		return new Expr('>>', lhs, this);
	}

	rlshift(lhs) {
		return new Expr('<<', lhs, this);
	}

	rtruediv(lhs) {
		return new Expr('/', lhs, this);
	}

	rfloordiv(lhs) {
		return new Expr('//', lhs, this);
	}

	rmatmul(lhs) {
		return new Expr('@', lhs, this);
	}

	/**
        Call: if 'f' is a Symbol, then f(0) == Expr('f', 0)."""
    */
	call(...args: any[]) {
		// if self.args:
		//     raise ValueError('Can only do a call for a Symbol, not an Expr')
		// else:
		//     return Expr(self.op, *args)
		//
		//    # Equality and repr
		if (this.args) {
		}
	}

	/**
	x == y' evaluates to True or False; does not build an Expr."""
	*/
	eq(other: Expr) {
		// return isinstance(other, Expr) and self.op == other.op and self.args == other.args
		let result = other instanceof Expr && this.hash() === other.hash();
		return new BoolExpr(result);
	}

	lt(other: Expr) {
		//	return isinstance(other, Expr) and str() < str(other)

		return other instanceof Expr && this.toString() < other.toString();
	}

	hash() {
		// return hash(self.op) ^ hash(self.args)

		const h =
			hash(this.op.toString()) ^
			hash(this.args.map((a) => a.toString()).join('_'));
		return h;
	}

	toString() {
		// op = self.op
		// args = [str(arg) for arg in self.args]
		// if op.isidentifier():  # f(x) or f(x, y)
		//     return '{}({})'.format(op, ', '.join(args)) if args else op
		// elif len(args) == 1:  # -x or -(x + 1)
		//     return op + args[0]
		// else:  # (x - y)
		//     opp = (' ' + op + ' ')
		//     return '(' + opp.join(args) + ')'
		//

		let args = this.args.map((i) => i.toString());

		const isIdentifier = () => {
			const op =
				typeof this.op === 'string'
					? this.op.toLowerCase()
					: (this.op.op as any).toLowerCase();
			return 'abcdefghijklmnopqrstuvwxyz'.indexOf(op) > -1;
		};
		if (isIdentifier()) {
			// f(x) or f(x, y)
			return args.length ? args.join(', ') : this.op;
		}
		if (args.length === 1) {
			// -x or -(x + 1)
			return this.op + args[0];
		}

		// (x - y)
		let opp = ' ' + this.op + ' ';
		return '(' + args.join(opp) + ')';
	}
}

export class BoolExpr {
	args: any[] = [];
	constructor(public op: boolean) {}

	and(rhs) {
		return new Expr('&', this, rhs);
	}

	or(rhs) {
		return new Expr('&', this, rhs);
	}

	eq(rhs) {
		return new BoolExpr(rhs.op === this.op);
	}

	xor(rhs) {
		return new BoolExpr(rhs.op !== this.op);
	}

	invert() {
		return new BoolExpr(!this.op);
	}

	toString() {
		return this.op;
	}
}
