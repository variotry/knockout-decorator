namespace variotry
{
	class Demo
	{
		private x: number = 10;
		public constructor()
		{
			var node = document.getElementById( "content" );
			ko.applyBindings( this, node );
		}
	}
	new Demo();
}