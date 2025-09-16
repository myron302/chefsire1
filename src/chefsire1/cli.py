"""Command-line interface for chefsire1."""

import sys
from typing import Optional, List
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm

from .models import Recipe, Ingredient, DifficultyLevel, MeasurementUnit, NutritionInfo
from .recipe_manager import RecipeManager

console = Console()


def format_time(minutes: int) -> str:
    """Format time in minutes to a readable string."""
    if minutes < 60:
        return f"{minutes}m"
    hours = minutes // 60
    remaining_minutes = minutes % 60
    if remaining_minutes == 0:
        return f"{hours}h"
    return f"{hours}h {remaining_minutes}m"


def display_recipe(recipe: Recipe) -> None:
    """Display a recipe in a formatted way."""
    # Header
    title = Text(recipe.name, style="bold magenta", justify="center")
    if recipe.description:
        subtitle = Text(recipe.description, style="italic", justify="center")
        header_text = Text.assemble(title, "\n", subtitle)
    else:
        header_text = title
    
    console.print(Panel(header_text, border_style="magenta"))
    
    # Basic info
    info_table = Table(show_header=False, box=None, padding=(0, 2))
    info_table.add_column("Label", style="bold cyan")
    info_table.add_column("Value", style="white")
    
    info_table.add_row("Difficulty:", recipe.difficulty.value.title())
    info_table.add_row("Prep Time:", format_time(recipe.prep_time_minutes))
    info_table.add_row("Cook Time:", format_time(recipe.cook_time_minutes))
    info_table.add_row("Total Time:", format_time(recipe.total_time_minutes))
    info_table.add_row("Servings:", str(recipe.servings))
    
    if recipe.author:
        info_table.add_row("Author:", recipe.author)
    
    if recipe.tags:
        info_table.add_row("Tags:", ", ".join(recipe.tags))
    
    console.print(info_table)
    console.print()
    
    # Ingredients
    console.print("[bold cyan]Ingredients:[/bold cyan]")
    for ingredient in recipe.ingredients:
        console.print(f"  • {ingredient}")
    console.print()
    
    # Equipment (if any)
    if recipe.equipment:
        console.print("[bold cyan]Equipment:[/bold cyan]")
        for item in recipe.equipment:
            console.print(f"  • {item}")
        console.print()
    
    # Instructions
    console.print("[bold cyan]Instructions:[/bold cyan]")
    for i, instruction in enumerate(recipe.instructions, 1):
        console.print(f"  {i}. {instruction}")
    console.print()
    
    # Nutrition (if available)
    if recipe.nutrition:
        console.print("[bold cyan]Nutrition (per serving):[/bold cyan]")
        nutrition = recipe.nutrition
        if nutrition.calories_per_serving:
            console.print(f"  • Calories: {nutrition.calories_per_serving}")
        if nutrition.protein_g:
            console.print(f"  • Protein: {nutrition.protein_g}g")
        if nutrition.carbs_g:
            console.print(f"  • Carbs: {nutrition.carbs_g}g")
        if nutrition.fat_g:
            console.print(f"  • Fat: {nutrition.fat_g}g")
        console.print()
    
    # Notes (if any)
    if recipe.notes:
        console.print(Panel(recipe.notes, title="Notes", border_style="yellow"))


@click.group()
@click.option('--data-dir', type=click.Path(), help='Directory to store recipe data')
@click.pass_context
def main(ctx, data_dir):
    """Chefsire1 - A modern recipe management and cooking assistant."""
    ctx.ensure_object(dict)
    ctx.obj['manager'] = RecipeManager(Path(data_dir) if data_dir else None)


@main.command()
@click.pass_context
def add(ctx):
    """Add a new recipe interactively."""
    manager = ctx.obj['manager']
    
    console.print("[bold green]Add New Recipe[/bold green]")
    console.print("Enter recipe details (press Ctrl+C to cancel)\n")
    
    try:
        # Basic information
        name = Prompt.ask("Recipe name")
        description = Prompt.ask("Description (optional)", default="")
        author = Prompt.ask("Author (optional)", default="")
        
        # Check if recipe already exists
        if manager.get_recipe(name):
            console.print(f"[red]Recipe '{name}' already exists![/red]")
            return
        
        # Timing and difficulty
        prep_time = int(Prompt.ask("Prep time (minutes)", default="15"))
        cook_time = int(Prompt.ask("Cook time (minutes)", default="30"))
        servings = int(Prompt.ask("Number of servings", default="4"))
        
        difficulty_options = [d.value for d in DifficultyLevel]
        difficulty = Prompt.ask(
            "Difficulty level", 
            choices=difficulty_options, 
            default="intermediate"
        )
        
        # Ingredients
        console.print("\n[bold cyan]Add ingredients (type 'done' when finished):[/bold cyan]")
        ingredients = []
        while True:
            ingredient_name = Prompt.ask("Ingredient name")
            if ingredient_name.lower() == 'done':
                break
            
            amount = float(Prompt.ask("Amount"))
            
            unit_options = [u.value for u in MeasurementUnit]
            unit = Prompt.ask("Unit", choices=unit_options)
            
            notes = Prompt.ask("Notes (optional)", default="")
            
            ingredients.append(Ingredient(
                name=ingredient_name,
                amount=amount,
                unit=MeasurementUnit(unit),
                notes=notes if notes else None
            ))
        
        if not ingredients:
            console.print("[red]Recipe must have at least one ingredient![/red]")
            return
        
        # Instructions
        console.print("\n[bold cyan]Add instructions (type 'done' when finished):[/bold cyan]")
        instructions = []
        step = 1
        while True:
            instruction = Prompt.ask(f"Step {step}")
            if instruction.lower() == 'done':
                break
            instructions.append(instruction)
            step += 1
        
        if not instructions:
            console.print("[red]Recipe must have at least one instruction![/red]")
            return
        
        # Optional details
        tags_input = Prompt.ask("Tags (comma-separated, optional)", default="")
        tags = [tag.strip() for tag in tags_input.split(',')] if tags_input else []
        
        equipment_input = Prompt.ask("Equipment (comma-separated, optional)", default="")
        equipment = [item.strip() for item in equipment_input.split(',')] if equipment_input else []
        
        notes = Prompt.ask("Recipe notes (optional)", default="")
        
        # Create and save recipe
        recipe = Recipe(
            name=name,
            description=description if description else None,
            author=author if author else None,
            prep_time_minutes=prep_time,
            cook_time_minutes=cook_time,
            servings=servings,
            difficulty=DifficultyLevel(difficulty),
            ingredients=ingredients,
            instructions=instructions,
            tags=tags,
            equipment=equipment,
            notes=notes if notes else None
        )
        
        manager.add_recipe(recipe)
        console.print(f"[green]Recipe '{name}' added successfully![/green]")
        
    except KeyboardInterrupt:
        console.print("\n[yellow]Recipe creation cancelled.[/yellow]")
    except ValueError as e:
        console.print(f"[red]Error: {e}[/red]")


@main.command()
@click.argument('name')
@click.pass_context
def show(ctx, name):
    """Show a recipe by name."""
    manager = ctx.obj['manager']
    
    recipe = manager.get_recipe(name)
    if not recipe:
        console.print(f"[red]Recipe '{name}' not found.[/red]")
        return
    
    display_recipe(recipe)


@main.command()
@click.option('--tags', help='Filter by tags (comma-separated)')
@click.option('--difficulty', type=click.Choice([d.value for d in DifficultyLevel]), 
              help='Filter by difficulty level')
@click.option('--max-time', type=int, help='Filter by maximum total time (minutes)')
@click.pass_context
def list(ctx, tags, difficulty, max_time):
    """List all recipes with optional filtering."""
    manager = ctx.obj['manager']
    
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else None
    recipes = manager.list_recipes(tags=tag_list, difficulty=difficulty, max_time=max_time)
    
    if not recipes:
        console.print("[yellow]No recipes found.[/yellow]")
        return
    
    console.print(f"[bold green]Found {len(recipes)} recipe(s):[/bold green]\n")
    
    for recipe_name in recipes:
        recipe = manager.get_recipe(recipe_name)
        if recipe:
            console.print(f"[bold]{recipe.name}[/bold]")
            console.print(f"  Difficulty: {recipe.difficulty.value.title()}")
            console.print(f"  Time: {format_time(recipe.total_time_minutes)}")
            console.print(f"  Servings: {recipe.servings}")
            if recipe.tags:
                console.print(f"  Tags: {', '.join(recipe.tags)}")
            console.print()


@main.command()
@click.argument('query')
@click.pass_context
def search(ctx, query):
    """Search recipes by name, tags, or ingredients."""
    manager = ctx.obj['manager']
    
    results = manager.search_recipes(query)
    
    if not results:
        console.print(f"[yellow]No recipes found matching '{query}'.[/yellow]")
        return
    
    console.print(f"[bold green]Found {len(results)} recipe(s) matching '{query}':[/bold green]\n")
    
    for recipe_name in results:
        recipe = manager.get_recipe(recipe_name)
        if recipe:
            console.print(f"[bold]{recipe.name}[/bold]")
            if recipe.description:
                console.print(f"  {recipe.description}")
            console.print()


@main.command()
@click.argument('name')
@click.pass_context
def delete(ctx, name):
    """Delete a recipe."""
    manager = ctx.obj['manager']
    
    recipe = manager.get_recipe(name)
    if not recipe:
        console.print(f"[red]Recipe '{name}' not found.[/red]")
        return
    
    if Confirm.ask(f"Are you sure you want to delete '{name}'?"):
        if manager.delete_recipe(name):
            console.print(f"[green]Recipe '{name}' deleted successfully![/green]")
        else:
            console.print(f"[red]Failed to delete recipe '{name}'.[/red]")
    else:
        console.print("[yellow]Deletion cancelled.[/yellow]")


@main.command()
@click.argument('name')
@click.pass_context
def shopping(ctx, name):
    """Generate a shopping list for a recipe."""
    manager = ctx.obj['manager']
    
    recipe = manager.get_recipe(name)
    if not recipe:
        console.print(f"[red]Recipe '{name}' not found.[/red]")
        return
    
    console.print(f"[bold green]Shopping list for '{recipe.name}':[/bold green]")
    console.print(f"[dim]Serves {recipe.servings}[/dim]\n")
    
    for ingredient in recipe.ingredients:
        console.print(f"☐ {ingredient}")


@main.command()
@click.pass_context
def tags(ctx):
    """List all available tags."""
    manager = ctx.obj['manager']
    
    all_tags = manager.get_all_tags()
    
    if not all_tags:
        console.print("[yellow]No tags found.[/yellow]")
        return
    
    console.print(f"[bold green]Available tags ({len(all_tags)}):[/bold green]\n")
    
    for tag in all_tags:
        console.print(f"  • {tag}")


if __name__ == '__main__':
    main()