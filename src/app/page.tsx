import React from 'react';
import AutomataSimulator from '@/components/AutomataSimulator';
import ElementaryAutomataSimulator from '@/components/ElementaryAutomataSimulator';
import CustomRuleSimulator from '@/components/CustomRuleSimulator';
import ForestFireSimulator from '@/components/ForestFireSimulator';
import CrystalGrowthSimulator from '@/components/CrystalGrowthSimulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Cellular Automata Visualizer</h1>
        <img src="/images/nyuad-logo.png" alt="NYU Abu Dhabi Logo" className="block mx-auto my-4 h-16" />
        <p className="text-muted-foreground text-lg">
          Explore famous rules, create your own, and simulate natural phenomena.
        </p>
      </header>

      <Tabs defaultValue="famous-2d" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="famous-2d">Famous 2D</TabsTrigger>
          <TabsTrigger value="elementary-1d">Elementary 1D</TabsTrigger>
          <TabsTrigger value="custom-bs">Custom B/S</TabsTrigger>
          <TabsTrigger value="fire">Forest Fire</TabsTrigger>
          <TabsTrigger value="crystal">Crystal Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="famous-2d">
          <Card>
            <CardHeader>
              <CardTitle>Famous 2D Automata</CardTitle>
              <CardDescription>Explore classic 2D rules like Conway's Game of Life, Seeds, and HighLife. Adjust speed and reset the grid.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutomataSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elementary-1d">
          <Card>
            <CardHeader>
              <CardTitle>Elementary 1D Automata</CardTitle>
              <CardDescription>Visualize 1D elementary cellular automata based on Wolfram codes (0-255). Observe complex patterns emerging from simple rules like Rule 30, 90, and 110.</CardDescription>
            </CardHeader>
            <CardContent>
              <ElementaryAutomataSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-bs">
          <Card>
            <CardHeader>
              <CardTitle>Custom B/S Rule Simulator</CardTitle>
              <CardDescription>Define your own 2D cellular automata rules using the Birth/Survival (B/S) notation (e.g., B3/S23 for Conway). Experiment with different conditions.</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomRuleSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fire">
          <Card>
            <CardHeader>
              <CardTitle>Forest Fire Simulation</CardTitle>
              <CardDescription>Simulate the spread of fire through a forest. Adjust tree density and the probability of ignition. Trees are green, burning trees are red, burnt trees are gray.</CardDescription>
            </CardHeader>
            <CardContent>
              <ForestFireSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crystal">
          <Card>
            <CardHeader>
              <CardTitle>Simple Crystal Growth</CardTitle>
              <CardDescription>Simulate basic crystal growth from a central seed. Adjust the neighbor threshold required for an empty cell to become part of the crystal (blue).</CardDescription>
            </CardHeader>
            <CardContent>
              <CrystalGrowthSimulator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-center text-muted-foreground text-sm mt-12">
        Created by NYUAD students
      </footer>
    </main>
  );
}

