class AvatarGenerator {
	constructor(seed) {

		var topTypeOptions = [];
        topTypeOptions.push(
          "NoHair",
          "Eyepatch",
          "Hat",
          "Hijab",
          "Turban",
          "WinterHat1",
          "WinterHat2",
          "WinterHat3",
          "WinterHat4",
          "LongHairBigHair",
          "LongHairBob",
          "LongHairBun",
          "LongHairCurly",
          "LongHairCurvy",
          "LongHairDreads",
          "LongHairFrida",
          "LongHairFro",
          "LongHairFroBand",
          "LongHairNotTooLong",
          "LongHairShavedSides",
          "LongHairMiaWallace",
          "LongHairStraight",
          "LongHairStraight2",
          "LongHairStraightStrand",
          "ShortHairDreads01",
          "ShortHairDreads02",
          "ShortHairFrizzle",
          "ShortHairShaggyMullet",
          "ShortHairShortCurly",
          "ShortHairShortFlat",
          "ShortHairShortRound",
          "ShortHairShortWaved",
          "ShortHairSides",
          "ShortHairTheCaesar",
          "ShortHairTheCaesarSidePart"
        );

        
        var accessoriesTypeOptions = [];
        accessoriesTypeOptions.push(
          "Blank",
          "Kurt",
          "Prescription01",
          "Prescription02",
          "Round",
          "Sunglasses",
          "Wayfarers"
        );


        
        var facialHairTypeOptions = [];
       	facialHairTypeOptions.push(
          "Blank",
          "BeardMedium",
          "BeardLight",
          "BeardMagestic",
          "MoustacheFancy",
          "MoustacheMagnum"
        );


        var facialHairColorOptions = [];
        facialHairColorOptions.push(
          "Auburn",
          "Black",
          "Blonde",
          "BlondeGolden",
          "Brown",
          "BrownDark",
          "Platinum",
          "Red"
        );

        var clotheTypeOptions = [];
        clotheTypeOptions.push(
          "BlazerShirt",
          "BlazerSweater",
          "CollarSweater",
          "GraphicShirt",
          "Hoodie",
          "Overall",
          "ShirtCrewNeck",
          "ShirtScoopNeck",
          "ShirtVNeck"
        );
        var eyeTypeOptions = [];
        eyeTypeOptions.push(
          "Close",
          "Cry",
          "Default",
          "Dizzy",
          "EyeRoll",
          "Happy",
          "Hearts",
          "Side",
          "Squint",
          "Surprised",
          "Wink",
          "WinkWacky"
        );
        
        var eyebrowTypeOptions = [];
        eyebrowTypeOptions.push(
          "Angry",
          "AngryNatural",
          "Default",
          "DefaultNatural",
          "FlatNatural",
          "RaisedExcited",
          "RaisedExcitedNatural",
          "SadConcerned",
          "SadConcernedNatural",
          "UnibrowNatural",
          "UpDown",
          "UpDownNatural"
        );

        var mouthTypeOptions = [];
        mouthTypeOptions.push(
          "Concerned",
          "Default",
          "Disbelief",
          "Eating",
          "Grimace",
          "Sad",
          "ScreamOpen",
          "Serious",
          "Smile",
          "Tongue",
          "Twinkle"
        );

        var skinColorOptions = [];
        skinColorOptions.push(
          "Tanned",
          "Yellow",
          "Pale",
          "Light",
          "Brown",
          "DarkBrown",
          "Black"
        );

        var hairColorOptions = [];
        hairColorOptions.push(
          "Auburn",
          "Black",
          "Blonde",
          "BlondeGolden",
          "Brown",
          "BrownDark",
          "PastelPink",
          "Platinum",
          "Red",
          "SilverGray"
        );

        var hatColorOptions = [];
        hatColorOptions.push(
          "Black",
          "Blue01",
          "Blue02",
          "Blue03",
          "Gray01",
          "Gray02",
          "Heather",
          "PastelBlue",
          "PastelGreen",
          "PastelOrange",
          "PastelRed",
          "PastelYellow",
          "Pink",
          "Red",
          "White"
        );

        var clotheColorOptions = [];
        clotheColorOptions.push(
          "Black",
          "Blue01",
          "Blue02",
          "Blue03",
          "Gray01",
          "Gray02",
          "Heather",
          "PastelBlue",
          "PastelGreen",
          "PastelOrange",
          "PastelRed",
          "PastelYellow",
          "Pink",
          "Red",
          "White"
        );

        this.availableOptions = {
        	'skinColor' : skinColorOptions,
        	'topType' : topTypeOptions,
        	'hairColor' : hairColorOptions,
        	'hatColor' : hatColorOptions,
        	'clotheType' : clotheTypeOptions,
        	'clotheColor' : clotheColorOptions,
        	'eyeType' : eyeTypeOptions,
        	'eyebrowType' : eyebrowTypeOptions,
        	'mouthType' : mouthTypeOptions,
        	'facialHairType' : facialHairTypeOptions,
        	'facialHairColor' : facialHairColorOptions,
        	'accessoriesType' : accessoriesTypeOptions                	
        }

        this.selectedOptions = {
        	'topType' : null,
        	'accessoriesType' : null,
        	'facialHairType' : null,
        	'facialHairColor' : null,
        	'clotheType' : null,
        	'eyeType' : null,
        	'eyebrowType' : null,
        	'mouthType' : null,
        	'skinColor' : null,
        	'hairColor' : null,
        	'hatColor' : null,
        	'clotheColor' : null
        }

        this.prettyNamesForOptions = {
        	'topType' : 'Top',
        	'accessoriesType' : 'Accessories',
        	'facialHairType' : 'Facial Hair',
        	'facialHairColor' : 'Facial Hair Color',
        	'clotheType' : 'Clothes',
        	'eyeType' : 'Eyes',
        	'eyebrowType' : 'Eyebrows',
        	'mouthType' : 'Mouth',
        	'skinColor' : 'Skin Color',
        	'hairColor' : 'Hair Color',
        	'hatColor' : 'Hat Color',
        	'clotheColor' : 'Clothe Color'
        }

        this.randomize(seed)
	}

	getOptionsFromURL(url) {
		if (!url) {
			console.log("url empty, doing nothing.", url);
			return;
		}

		let queryString = url.split('?')[1]
		let parameters = new URLSearchParams(queryString)

		for (var option in this.selectedOptions) {
			this.selectedOptions[option] = parameters.get(option)
		}
	}

	generateURLFromOptions(changedOption = null, changedOptionValue = null) {
		var url = 'https://avataaars.io/?avatarStyle=Transparent'

		for (var option in this.selectedOptions) {
			if (this.selectedOptions[option]) {
				if (changedOption && changedOption == option && changedOptionValue) {
					url += '&' + option + '=' + changedOptionValue
				} else {
					url += '&' + option + '=' + this.selectedOptions[option] 	
				}
			}
		}

		return url;
	}

	randomize(seed) {

		let rng = new Math.seedrandom(seed);

		for (var option in this.selectedOptions) {
			this.selectedOptions[option] = this.availableOptions[option][Math.floor(rng() * this.availableOptions[option].length)]
		}
	}

	setOption(option, value) {
		this.selectedOptions[option] = value
	}
}