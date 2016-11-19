class TabCtrl {

	constructor($state) {
		this.selectedTab = 1;
		this.state = $state;
	}

	navigate() {
		console.log('Change state', this.selectedTab);
		this.state.go('profile.overview');
	}

}

angular.module('common.tab').controller('tabCtrl', TabCtrl);
