import readline from 'readline-sync';

//console.log("╔═════╕\n║5    │\n║  ♥  │\n║    5│\n╙─────┘");
//console.log("┌─────╖\n│5    ║\n│  ♥  ║\n│    5║\n╘═════╝");
//const move = readline.question( "\x1b[33m(13:30) Dealer\x1b[0m: (h)it, or (s)tay?" );
// inCmd = readline.question( "\x1b[33m(13:30) Dealer\x1b[0m: (h)it, or (s)tay?" );	


const bannerArt = " ██████  █████  ███████ ██ ███    ██  ██████      ███    ███  █████   ██████  ███    ██ ██ ███████ ██  ██████  ██    ██ ███████ ██ \n██      ██   ██ ██      ██ ████   ██ ██    ██     ████  ████ ██   ██ ██       ████   ██ ██ ██      ██ ██    ██ ██    ██ ██      ██ \n██      ███████ ███████ ██ ██ ██  ██ ██    ██     ██ ████ ██ ███████ ██   ███ ██ ██  ██ ██ █████   ██ ██    ██ ██    ██ █████   ██ \n██      ██   ██      ██ ██ ██  ██ ██ ██    ██     ██  ██  ██ ██   ██ ██    ██ ██  ██ ██ ██ ██      ██ ██ ▄▄ ██ ██    ██ ██         \n ██████ ██   ██ ███████ ██ ██   ████  ██████      ██      ██ ██   ██  ██████  ██   ████ ██ ██      ██  ██████   ██████  ███████ ██ \n                                                                                                          ▀▀                       "
const titleScreen = "\t~~ Welcome to Casino Magnifique ~~\n\t~~   Where dreams go to die     ~~\n\t~~            (P)lay            ~~\n\t~~            (Q)uit            ~~"

let inCmd = "no";




class GameOfBlackjack {
	dealer : BlackjackPlayer;
	player : BlackjackPlayer;
	chatLog : Chatroom;
	deck : DeckOfCards;
	firstDealerCard : Card; // NOTE Not good, special case stuff
	
	constructor() {
		this.dealer = new BlackjackPlayer("Dealer", 17, "\x1b[33m");
		this.player = new BlackjackPlayer("Player", 21, "\x1b[32m");
		this.chatLog = new Chatroom(10);
		this.deck = new DeckOfCards();
		this.firstDealerCard = new Card("J", [0], "K", ""); // Joker to prevent shit.
	}



	gameloop() {

		let play = true;
		this.new_hand()
		let d_fix_string = `${this.dealer.color}${this.dealer.name}:\x1b[0m `;
		let p_fix_string = `${this.player.color}${this.player.name}:\x1b[0m `;

		this.chatLog.message(d_fix_string + "Welcome, patron. Have a drink and let me deal a hand.");
		this.chatLog.message(d_fix_string + "The flop... and what for you, sir?");

		while(play) {
			this.render_game();

			// Win condition checks player bust, 
			if(this.dealer.stayed && this.player.stayed) {
				if(this.player.tally_score() > this.dealer.tally_score()) {
					// player win
					this.chatLog.message(d_fix_string + "You win, congratulations. Shall we (p)lay again, or (l)eave?");
					this.firstDealerCard.hidden = false;
				} else if(this.player.tally_score() == this.dealer.tally_score()) {
					// tie
					this.chatLog.message(d_fix_string + "A Tie? Interesting. Shall we (p)lay again, or (l)eave?");
					this.firstDealerCard.hidden = false;
				} else {
					// dealer win
					this.chatLog.message(d_fix_string + "Better luck next time. Shall we (p)lay again, or (l)eave?");
					this.firstDealerCard.hidden = false;
				}
				this.render_game();
				inCmd = readline.question(p_fix_string);
				if( inCmd.startsWith("p") || inCmd.includes("play")) {
					this.chatLog.message(p_fix_string + "2" +  inCmd);
					this.chatLog.message(d_fix_string + "Excellent, a new game then!");
					this.new_hand()
					continue;
				} else if( inCmd.startsWith("l") || inCmd.includes("leave")) {
					break;
				}
			} else if(this.player.tally_score() == this.player.threshold) {		
				this.chatLog.message(d_fix_string + "A blackjack right off the start? This might be your lucky day.");
				this.player.stayed = true;
				this.render_game();
			}
			

			// SECTION  Player Turn
			if(this.player.stayed == false) {
				inCmd = readline.question(p_fix_string);
				if( inCmd.startsWith("h") || inCmd.includes("hit")) {
					this.player.hit(this.deck.draw());

				} else if( inCmd.startsWith("f") || inCmd.includes("fold")) {
					play = false;
				} else if( inCmd.startsWith("s") || inCmd.includes("stay")) {
					this.player.stayed = true;
				}
				this.chatLog.message(p_fix_string + inCmd);
				// check for blackjack
				if(this.player.tally_score() == this.player.threshold) {		
					this.chatLog.message(d_fix_string + "You have gotten a blackjack, sir! Congratulations, I'll draw from now on.");
					this.player.stayed = true;
					this.render_game();
				}
				if(this.player.tally_score() > this.player.threshold) {
					this.chatLog.message(d_fix_string + "It seems you have busted, sir. Shall we (p)lay again, or (l)eave?");
					this.firstDealerCard.hidden = false;
					this.render_game()
					//
					inCmd = readline.question(p_fix_string);
					if( inCmd.startsWith("p") || inCmd.includes("play")) {
						this.chatLog.message(p_fix_string + inCmd);
						this.chatLog.message(d_fix_string + "Excellent, a new game then!");
						this.new_hand()
						continue;
					} else if( inCmd.startsWith("l") || inCmd.includes("leave")) {
						break;
					}
				}
			} 
			// !SECTION

			// SECTION Dealer Turn
			if(this.dealer.tally_score() < this.dealer.threshold) {
				this.chatLog.message(d_fix_string + "I'll draw a card.");
				this.dealer.hit(this.deck.draw());
				if(this.dealer.tally_score() > 21) { // TODO Remove magic number
					this.chatLog.message(d_fix_string + "I have busted. How unfortunate. Shall we (p)lay again, or (l)eave?");
					this.firstDealerCard.hidden = false;
					// TODO win condition
					this.render_game();
					let inCmd = readline.question(p_fix_string);
					if( inCmd.startsWith("p") || inCmd.includes("play")) {
						this.chatLog.message(p_fix_string +  inCmd);
						this.chatLog.message(d_fix_string + "Excellent, a new game then!");
						this.new_hand()
						continue;
					} else if( inCmd.startsWith("l") || inCmd.includes("leave")) {
						break;
					}
					} else if(this.dealer.tally_score() >= this.dealer.threshold) {
						this.chatLog.message(d_fix_string + "I'll have to hold now.");
						this.dealer.stayed = true;
				}
			} else {
				this.chatLog.message(d_fix_string + "Dealer stays");
				this.dealer.stayed = true;				
			}
			// !SECTION
			
		}
	}

	render_game() {
		console.clear();
		this.dealer.render_hand();
		this.player.render_hand();
		console.log("\t│Actions:\x1b[1m (h)it, (s)tay, (f)old\x1b[0m");
		this.chatLog.render();
	}

	new_hand() {
		// restart it all
		this.deck.discard(this.dealer.discard());
		this.deck.discard(this.player.discard());
		this.deck.shuffle();

		this.firstDealerCard = this.deck.draw();
		this.firstDealerCard.hidden = true;
		this.dealer.hit(this.firstDealerCard);
		this.dealer.hit(this.deck.draw());
		this.dealer.stayed = false;

		this.player.hit(this.deck.draw());
		this.player.hit(this.deck.draw());
		this.player.stayed = false;
		
	}
}

class BlackjackPlayer {
	name : string;
	hand : Card[];
	threshold : number;
	color: string;
	stayed = false;
	constructor(name : string, threshold : number, color : string) {
		this.name = name; 
		this.threshold = threshold;
		this.hand = new Array<Card>;
		this.color = color;
	}

	hit(nCard : Card) {
		this.hand.push(nCard);
		let sum = 0;
		for (let index = 0; index < this.hand.length; index++) {
			const element = this.hand[index];
			sum += element.values[0]; // NOTE We only use first value right now.
		}
	}

	discard() : Card[] {
		let returnable : Card[] = this.hand;
		this.hand = new Array<Card>;
		return returnable;
	}

	render_hand() {
		const CARD_HEIGHT = 5;
		const PLAYER_READOUT = [
		//   player
			`┌───────┘ `,
			`│${this.name}   `, // NOTE Hardcoded length, padStart() not present in ES2016
			`│Score:   `,
			`│ ${this.tally_score_string()}\t  `,
			`╘═══════╕ `
		]
		for (let i = 0; i < CARD_HEIGHT; i++) {
			let mes = PLAYER_READOUT[i];
			for (let index = 0; index < this.hand.length; index++) {
				const element = this.hand[index];
				mes += element.draw_line(i)
			}
			console.log(mes);
		}
	}

	tally_score_string() : string {
		let returnable : string = "";
		let score = this.tally_score();
		if(this.hand[0].hidden == true) {
			returnable += ">";
			score -= this.hand[0].values[this.hand[0].lastUsedValue];
		} else {
			returnable += " ";
		}
		if( score > 9) {
			returnable += score.toString();
		} else {
			returnable += " " + score.toString();
		}
		return returnable;
	}

	tally_score() : number {

		let returnable = 0;
		let minimized = 0; // if it matches length of hand, score is fully minimized
		let valueAlterationIteration = 0; // the current max steps down. 

		for (let card_index = 0; card_index < this.hand.length; card_index++) {
			const my_card = this.hand[card_index];
			my_card.lastUsedValue = 0;
			returnable += my_card.values[my_card.lastUsedValue];
		}

		if(returnable > this.threshold) {
			while(minimized < this.hand.length) { // While hand not at fully minimum value
				//console.log(`\n\nMinimized=${minimized} Hand Len=${this.hand.length}`);
				minimized = 0;
				for (let card_index = 0; card_index < this.hand.length; card_index++) {
					const my_card = this.hand[card_index];
					if(my_card.values.length > 1 && my_card.lastUsedValue < valueAlterationIteration) {
						my_card.lastUsedValue += 1;
						break;
					}
					if(my_card.lastUsedValue + 1 == my_card.values.length) {
						minimized += 1;
					}
					if(card_index == this.hand.length-1) {
						// Got to the end but didn't get no body, next time go deeper!
						valueAlterationIteration += 1; 
					}
				}
				// Sum cards of new value
				returnable = 0;
				for (let card_index = 0; card_index < this.hand.length; card_index++) {
					const my_card = this.hand[card_index];
					returnable += my_card.values[my_card.lastUsedValue];
					//console.log(my_card.to_string() + " " + my_card.lastUsedValue);
				}
				if(returnable <= this.threshold) {
					break;
				}
			}

		}
		return returnable;
	}
}

class DeckOfCards {
	deck : Card[];
	discardPile : Card[];
	constructor() {
		this.deck = new Array<Card>;
		this.discardPile = new Array<Card>;
		// Build up a deck of cards
		let cnames = ["2","3","4","5","6","7","8","9","10","J","Q","K"];
		let suits = [["♥","\x1b[31m"],["♣","\x1b[36m"],["♠","\x1b[34m"],["♦","\x1b[35m"]];
		for (let index = 0; index < suits.length; index++) {
			const suit = suits[index];
			let ace = new Card("A", [11,1], suit[0], suit[1]);
			this.deck.push(ace);
			for (let cardIndex = 0; cardIndex < cnames.length; cardIndex++) {
				const card_we_making = cnames[cardIndex];
				let cardValue = Math.min(cardIndex+2, 10);
				let nCard = new Card(card_we_making, [cardValue], suit[0], suit[1]);
				this.deck.push(nCard);
			}
		}

	} 

	shuffle() {
		if(this.deck.length <= 30) {
			this.deck = this.deck.concat(this.discardPile);
			this.discardPile = new Array<Card>;
		}		
		this.deck.sort(function (a, b) {
			return Math.random() - 0.5;
		})
	}

	draw() : Card {
		// TODO reshuffle on not enough cards
		return this.deck.pop() as Card; // NOTE We are trusting that other guy (me) to put the card back!
	}

	discard(old_cards : Card[]) {
		for (let I = 0; I < old_cards.length; I++) {
			old_cards[I].hidden = false;
			this.discardPile.push(old_cards[I]);	
		}
		
	}

	printDeck() {
		for (let index = 0; index < this.deck.length; index++) {
			const element = this.deck[index];
			console.log(element.to_string());
		}
	}
}

class Card {
	name : string;
	values : number[];
	suit : string;
	color : string;
	hidden: boolean = false;
	lastUsedValue = 0;

	constructor(name: string, possible_values : number[], suit : string, color : string) {
		this.name = name;
		this.values = possible_values;
		this.suit = suit;
		this.color = color;
	}

	to_string() : string {
		return `${this.color}${this.suit} ${this.name}-\t[${this.values}]\x1b[0m`;
	}

	draw_line(line : number) : string {

		if(this.hidden) {
			let graphics = [
				"\x1b[1m┌─────╖\x1b[0m",
				"\x1b[1m│ ╲ ╱ ║\x1b[0m",
				"\x1b[1m│  ╳  ║\x1b[0m",
				"\x1b[1m│ ╱ ╲ ║\x1b[0m",
				"\x1b[1m╘═════╝\x1b[0m"
			]
			return graphics[line]
		}
		
		let color = this.color;
		let name = this.name;
		let suit = this.suit;
		let val = this.values[this.lastUsedValue].toString();
		let graphics = [
			`${color}┌─────╖\x1b[0m`,
			`${color}│${name}    ║\x1b[0m`,
			`${color}│  ${suit}  ║\x1b[0m`,
			`${color}│    ${val}║\x1b[0m`,
			`${color}╘═════╝\x1b[0m`
		]
		// Special cases
		if(name.length > 1) {graphics[1] = `${color}│${name}   ║\x1b[0m`}
		if(val.length > 1)  {graphics[3] = `${color}│   ${val}║\x1b[0m`}

		return graphics[line];
	}
}

class Chatroom {
	chatLog : string[];
	visible_size : number;

	constructor(visible_size : number) {
		this.chatLog = new Array<string>;
		this.visible_size = visible_size;
	}

	message(mes : string) {
		this.chatLog.push(mes);
	}

	render() {
		let offset = Math.max(0, this.chatLog.length - this.visible_size);
		console.log("╔═══════╧═══════════════════════════════════════════════════════════════════════");	
		for (let index = 0; index < this.visible_size; index++) {
			if(index >= this.chatLog.length) {
				console.log("║");			
			} else {
				console.log("║" + this.chatLog[index +offset]);			
			}
			
		}
		console.log("╚═══════════════════════════════════════════════════════════════════════════════");	
	}
}




// Main menu loopy
while (inCmd != "quit") {

	console.clear();
	console.log(bannerArt);
	console.log(titleScreen);
	inCmd = readline.question( "" );	

	if(inCmd == "play" || inCmd.charAt(0) == 'p') {
		let current_game = new GameOfBlackjack();
		current_game.gameloop();
	}
	
}

// Order of game : 